import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import socket from "../socket";
import bikeIconUrl from "../assets/bike.png";

const bikeIcon = L.icon({
  iconUrl: bikeIconUrl,
  iconSize: [40, 40],
});

const MapView = ({ orderId }) => {
  const [position, setPosition] = useState([28.6139, 77.2090]);

  useEffect(() => {
    socket.on(`location-${orderId}`, ({ latitude, longitude }) => {
      console.log("📍 Location received:", latitude, longitude);
      setPosition([latitude, longitude]);
    });
  }, []);

  return (
    <MapContainer center={position} zoom={15} style={{ height: "100vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={position} icon={bikeIcon} />
    </MapContainer>
  );
};

export default MapView;
