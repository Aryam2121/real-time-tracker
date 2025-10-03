import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import socket from "../socket";
import bikeIconUrl from "../assets/bike.png";
import "./DeliveryTracker.css";
import { formatDistance } from "date-fns";

// Simple icon components using Unicode emojis
const Clock = () => <span>🕐</span>;
const User = () => <span>👤</span>;
const Phone = () => <span>📞</span>;
const Star = () => <span>⭐</span>;
const Package = () => <span>📦</span>;
const CheckCircle = () => <span>✅</span>;
const Truck = () => <span>🚛</span>;
const Home = () => <span>🏠</span>;

// Enhanced bike icon with rotation capability
const createRotatedBikeIcon = (rotation = 0) => {
  return L.divIcon({
    html: `<div style="transform: rotate(${rotation}deg); transition: transform 0.3s ease;">
      <img src="${bikeIconUrl}" style="width: 40px; height: 40px;" />
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const storeIcon = L.divIcon({
  html: `<div style="background: #ff6b35; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
    <span style="color: white; font-size: 16px;">🏪</span>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const customerIcon = L.divIcon({
  html: `<div style="background: #4CAF50; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
    <span style="color: white; font-size: 16px;">🏠</span>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

// Component to handle smooth movement along route
const SmoothMarker = ({ position, previousPosition, icon }) => {
  const markerRef = useRef(null);
  
  useEffect(() => {
    if (markerRef.current && previousPosition) {
      const marker = markerRef.current;
      
      // Calculate rotation angle based on movement direction
      const lat1 = previousPosition[0] * Math.PI / 180;
      const lat2 = position[0] * Math.PI / 180;
      const deltaLng = (position[1] - previousPosition[1]) * Math.PI / 180;
      
      const y = Math.sin(deltaLng) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
      
      const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
      
      // Smooth animation to new position
      marker.setLatLng(position);
      
      // Update icon with rotation
      const rotatedIcon = createRotatedBikeIcon(bearing);
      marker.setIcon(rotatedIcon);
    }
  }, [position, previousPosition]);
  
  return (
    <Marker 
      ref={markerRef}
      position={position} 
      icon={icon}
    >
      <Popup>
        <div>
          <strong>Delivery Partner</strong><br />
          Moving along route...
        </div>
      </Popup>
    </Marker>
  );
};

// Component to handle routing
const RoutingMachine = ({ storeLocation, customerLocation, currentLocation, orderStatus }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Remove existing routing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Determine waypoints based on order status
    let waypoints = [];
    
    if (orderStatus === 'pickup') {
      // Route from current location to store
      waypoints = [
        L.latLng(currentLocation[0], currentLocation[1]),
        L.latLng(storeLocation[0], storeLocation[1])
      ];
    } else if (orderStatus === 'delivering') {
      // Route from current location to customer
      waypoints = [
        L.latLng(currentLocation[0], currentLocation[1]),
        L.latLng(customerLocation[0], customerLocation[1])
      ];
    } else if (orderStatus === 'delivered') {
      // No route needed
      return;
    } else {
      // Default: show full route from store to customer
      waypoints = [
        L.latLng(storeLocation[0], storeLocation[1]),
        L.latLng(customerLocation[0], customerLocation[1])
      ];
    }

    if (waypoints.length > 0) {
      // Create routing control
      routingControlRef.current = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        addWaypoints: false,
        createMarker: () => null, // Don't create markers (we have our own)
        lineOptions: {
          styles: [
            {
              color: '#2196F3', // Blue color like Zomato/Blinkit
              weight: 6,
              opacity: 0.8,
              lineCap: 'round',
              lineJoin: 'round'
            }
          ]
        },
        show: false, // Hide the routing instructions panel
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving' // Use driving profile for realistic routes
        })
      }).addTo(map);

      // Custom styling for the route
      routingControlRef.current.on('routesfound', function(e) {
        const routes = e.routes;
        
        // Add animated dots on the route for movement effect
        const route = routes[0];
        if (route && route.coordinates) {
          // Add pulsing effect to show active delivery
          const routeLine = document.querySelector('.leaflet-routing-container .leaflet-interactive');
          if (routeLine && orderStatus === 'delivering') {
            routeLine.style.animation = 'routePulse 2s ease-in-out infinite';
          }
        }
      });
    }

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, storeLocation, customerLocation, currentLocation, orderStatus]);

  return null;
};

const DeliveryTracker = ({ orderId }) => {
  const [deliveryData, setDeliveryData] = useState({
    currentLocation: [28.6139, 77.2090],
    storeLocation: [28.6129, 77.2285], // Store location
    customerLocation: [28.6304, 77.2177], // Customer location
    status: "confirmed",
    estimatedTime: 25,
    deliveryPartner: {
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      rating: 4.8,
      vehicleNumber: "DL-12-AB-3456"
    },
    orderDetails: {
      items: ["2x Burger", "1x Pizza", "2x Coke"],
      total: "₹450",
      orderTime: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
    }
  });

  const [route, setRoute] = useState([]);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  // Create bike icon with current position
  const bikeIcon = createRotatedBikeIcon(0);

  const statusSteps = [
    { key: "confirmed", label: "Order Confirmed", icon: CheckCircle, time: "2 min ago" },
    { key: "preparing", label: "Preparing", icon: Package, time: "5 min ago" },
    { key: "pickup", label: "Out for Pickup", icon: Truck, time: "8 min ago" },
    { key: "delivering", label: "On the Way", icon: Truck, time: "Now" },
    { key: "delivered", label: "Delivered", icon: Home, time: "" }
  ];

  useEffect(() => {
    // Listen for real-time location updates
    socket.on(`location-${orderId}`, (data) => {
      console.log("📍 Location received:", data);
      
      // Store previous location for smooth animation
      setPreviousLocation(deliveryData.currentLocation);
      setIsMoving(true);
      
      setDeliveryData(prev => ({
        ...prev,
        currentLocation: [data.latitude, data.longitude],
        status: data.status || prev.status,
        estimatedTime: data.estimatedTime || prev.estimatedTime
      }));
      
      // Reset moving state after animation
      setTimeout(() => setIsMoving(false), 1000);
    });

    // Listen for status updates
    socket.on(`status-${orderId}`, (data) => {
      setDeliveryData(prev => ({
        ...prev,
        status: data.status,
        estimatedTime: data.estimatedTime
      }));
    });

    return () => {
      socket.off(`location-${orderId}`);
      socket.off(`status-${orderId}`);
    };
  }, [orderId, deliveryData.currentLocation]);

  // Separate useEffect for route calculation
  useEffect(() => {
    setRoute([
      deliveryData.storeLocation,
      deliveryData.currentLocation,
      deliveryData.customerLocation
    ]);
  }, [deliveryData.storeLocation, deliveryData.currentLocation, deliveryData.customerLocation]);

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.key === deliveryData.status);
  };

  const getEstimatedDeliveryTime = () => {
    const now = new Date();
    const deliveryTime = new Date(now.getTime() + deliveryData.estimatedTime * 60000);
    return deliveryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="delivery-tracker">
      {/* Header */}
      <div className="tracker-header">
        <div className="delivery-info">
          <h2>Your order is on the way!</h2>
          <div className="eta-info">
            <Clock />
            <span>Arriving in {deliveryData.estimatedTime} min • {getEstimatedDeliveryTime()}</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="map-container">
        <MapContainer 
          center={deliveryData.currentLocation} 
          zoom={14} 
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Routing Component for Road-based Navigation */}
          <RoutingMachine 
            storeLocation={deliveryData.storeLocation}
            customerLocation={deliveryData.customerLocation}
            currentLocation={deliveryData.currentLocation}
            orderStatus={deliveryData.status}
          />

          {/* Store Marker */}
          <Marker position={deliveryData.storeLocation} icon={storeIcon}>
            <Popup>
              <div>
                <strong>Restaurant/Store</strong><br />
                Order pickup location
              </div>
            </Popup>
          </Marker>

          {/* Delivery Partner Marker with Smooth Movement */}
          <SmoothMarker 
            position={deliveryData.currentLocation} 
            previousPosition={previousLocation}
            icon={bikeIcon}
          />

          {/* Customer Marker */}
          <Marker position={deliveryData.customerLocation} icon={customerIcon}>
            <Popup>
              <div>
                <strong>Your Location</strong><br />
                Delivery destination
              </div>
            </Popup>
          </Marker>

          {/* Route Line - Keep as fallback */}
          {route.length > 0 && deliveryData.status === 'delivered' && (
            <Polyline 
              positions={route} 
              color="#4CAF50" 
              weight={4} 
              opacity={0.7}
              dashArray="10, 10"
            />
          )}
        </MapContainer>
      </div>

      {/* Delivery Partner Info */}
      <div className="delivery-partner-card">
        <div className="partner-info">
          <div className="partner-avatar">
            <User />
          </div>
          <div className="partner-details">
            <h3>{deliveryData.deliveryPartner.name}</h3>
            <div className="partner-rating">
              <Star />
              <span>{deliveryData.deliveryPartner.rating}</span>
            </div>
            <p>Vehicle: {deliveryData.deliveryPartner.vehicleNumber}</p>
          </div>
        </div>
        <button className="call-button">
          <Phone />
        </button>
      </div>

      {/* Order Status Timeline */}
      <div className="status-timeline">
        <h3>Order Status</h3>
        <div className="timeline">
          {statusSteps.map((step, index) => {
            const isActive = index <= getCurrentStepIndex();
            const isCurrent = index === getCurrentStepIndex();
            const IconComponent = step.icon;
            
            return (
              <div key={step.key} className={`timeline-item ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="timeline-icon">
                  <IconComponent />
                </div>
                <div className="timeline-content">
                  <h4>{step.label}</h4>
                  <span className="timeline-time">{step.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary */}
      <div className="order-summary">
        <h3>Order Summary</h3>
        <div className="order-items">
          {deliveryData.orderDetails.items.map((item, index) => (
            <div key={index} className="order-item">
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div className="order-total">
          <strong>Total: {deliveryData.orderDetails.total}</strong>
        </div>
        <div className="order-time">
          Ordered {formatDistance(deliveryData.orderDetails.orderTime, new Date(), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracker;