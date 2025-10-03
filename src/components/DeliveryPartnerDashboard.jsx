import { useState, useEffect } from 'react';
import socket from '../socket';
import './DeliveryPartnerDashboard.css';

const DeliveryPartnerDashboard = () => {
  const [currentOrder] = useState({
    orderId: '12345',
    customerName: 'John Doe',
    customerPhone: '+91 98765 43210',
    customerAddress: 'Connaught Place, New Delhi',
    items: ['2x Burger', '1x Pizza', '2x Coke'],
    total: '₹450'
  });
  
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 28.6129,
    longitude: 77.2285
  });
  
  const [orderStatus, setOrderStatus] = useState('pickup');
  const [isOnline, setIsOnline] = useState(false);

  const statusOptions = [
    { value: 'pickup', label: 'Heading to Pickup', color: '#ff6b35' },
    { value: 'delivering', label: 'Out for Delivery', color: '#4CAF50' },
    { value: 'delivered', label: 'Delivered', color: '#2196F3' }
  ];

  useEffect(() => {
    if (isOnline && currentOrder.orderId) {
      // Simulate location updates every 5 seconds
      const interval = setInterval(() => {
        // Simulate small location changes
        setCurrentLocation(prev => ({
          latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
          longitude: prev.longitude + (Math.random() - 0.5) * 0.001
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isOnline, currentOrder.orderId]);

  useEffect(() => {
    if (isOnline) {
      const estimatedTime = orderStatus === 'pickup' ? 25 : 
                          orderStatus === 'delivering' ? 15 : 0;
      
      socket.emit('update-location', {
        orderId: currentOrder.orderId,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        status: orderStatus,
        estimatedTime
      });
    }
  }, [currentLocation, orderStatus, isOnline, currentOrder.orderId]);

  const handleStatusChange = (newStatus) => {
    setOrderStatus(newStatus);
    
    socket.emit('update-status', {
      orderId: currentOrder.orderId,
      status: newStatus,
      estimatedTime: newStatus === 'pickup' ? 25 : 
                    newStatus === 'delivering' ? 15 : 0
    });
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  const simulateDelivery = () => {
    fetch(`http://localhost:5000/api/simulate-delivery/${currentOrder.orderId}`, {
      method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
      console.log('Simulation started:', data);
    })
    .catch(error => {
      console.error('Error starting simulation:', error);
    });
  };

  return (
    <div className="delivery-partner-dashboard">
      <div className="dashboard-header">
        <h1>Delivery Partner Dashboard</h1>
        <div className="partner-status">
          <button 
            className={`status-toggle ${isOnline ? 'online' : 'offline'}`}
            onClick={toggleOnlineStatus}
          >
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </button>
        </div>
      </div>

      {currentOrder && (
        <div className="current-order">
          <h2>Current Order</h2>
          <div className="order-info">
            <div className="order-header">
              <span className="order-id">#{currentOrder.orderId}</span>
              <span className="order-total">{currentOrder.total}</span>
            </div>
            
            <div className="customer-info">
              <h3>Customer Details</h3>
              <p><strong>Name:</strong> {currentOrder.customerName}</p>
              <p><strong>Phone:</strong> {currentOrder.customerPhone}</p>
              <p><strong>Address:</strong> {currentOrder.customerAddress}</p>
            </div>

            <div className="order-items">
              <h3>Items</h3>
              <ul>
                {currentOrder.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="status-controls">
        <h3>Update Status</h3>
        <div className="status-buttons">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              className={`status-btn ${orderStatus === status.value ? 'active' : ''}`}
              style={{ backgroundColor: orderStatus === status.value ? status.color : '#f0f0f0' }}
              onClick={() => handleStatusChange(status.value)}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      <div className="location-info">
        <h3>Current Location</h3>
        <p>Lat: {currentLocation.latitude.toFixed(6)}</p>
        <p>Lng: {currentLocation.longitude.toFixed(6)}</p>
        <p>Status: <span className="current-status">{orderStatus}</span></p>
      </div>

      <div className="simulation-controls">
        <h3>Testing Tools</h3>
        <button 
          className="simulate-btn"
          onClick={simulateDelivery}
        >
          🚀 Start Delivery Simulation
        </button>
        <p className="simulation-note">
          This will simulate a complete delivery journey from pickup to delivery
        </p>
      </div>
    </div>
  );
};

export default DeliveryPartnerDashboard;