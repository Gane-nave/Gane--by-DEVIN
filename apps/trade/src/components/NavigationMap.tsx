import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useGaneStore } from '../store/navStore';
import { ShieldAlert, Construction, AlertTriangle, CloudRain, Car } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix Leaflet icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom component to handle camera follow
const CameraFollow = ({ position, heading, isNavigating }: { position: [number, number], heading: number, isNavigating: boolean }) => {
  const map = useMap();
  
  useEffect(() => {
    if (isNavigating) {
      // Smooth pan to current position
      map.panTo(position, { animate: true, duration: 1 });
    } else {
      map.setView(position, map.getZoom());
    }
  }, [position, isNavigating, map]);
  
  return null;
};

export const NavigationMap: React.FC = () => {
  const { currentPosition, route, nav, isNavigating } = useGaneStore();
  const routeCoords = route.map(p => [p.lat, p.lng] as [number, number]);
  
  // Include current position in the drawn route
  const fullRoute = [currentPosition, ...routeCoords];

  // Create a custom div icon for the vehicle that rotates based on heading
  const createVehicleIcon = (heading: number) => {
    return L.divIcon({
      className: 'clear-none border-0 bg-transparent',
      html: `
        <div style="transform: rotate(${heading}deg); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 10px rgba(0,243,255,0.8));">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f3ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 2 22 12 18 22 22 12 2" fill="rgba(0,243,255,0.2)"></polygon>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  const getIncidentIcon = (type: string, severity: string) => {
    let IconComponent = AlertTriangle;
    if (type === 'ACCIDENT') IconComponent = Car;
    if (type === 'CONSTRUCTION') IconComponent = Construction;
    if (type === 'WEATHER') IconComponent = CloudRain;

    let colorClass = 'text-gane-blue border-gane-blue';
    if (severity === 'HIGH' || severity === 'CRITICAL') colorClass = 'text-gane-red border-gane-red';
    else if (severity === 'MEDIUM') colorClass = 'text-gane-yellow border-gane-yellow';

    const html = renderToString(
      <div className={`w-8 h-8 bg-black/80 border-2 ${colorClass} rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm`}>
        <IconComponent size={16} className="currentColor" />
      </div>
    );

    return L.divIcon({
      className: 'clear-none border-0 bg-transparent',
      html,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <MapContainer 
      center={currentPosition} 
      zoom={16} 
      className="w-full h-full"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      <CameraFollow position={currentPosition} heading={nav.heading} isNavigating={isNavigating} />
      
      {/* Route Polyline */}
      {isNavigating && (
        <>
          {/* Glow effect line */}
          <Polyline 
            positions={fullRoute} 
            color="rgba(0, 243, 255, 0.3)" 
            weight={12} 
            lineCap="round"
            lineJoin="round"
          />
          {/* Core line */}
          <Polyline 
            positions={fullRoute} 
            color="#00f3ff" 
            weight={4} 
            lineCap="round"
            lineJoin="round"
            dashArray="10, 10"
            className="animate-road-move"
          />
        </>
      )}

      {/* Vehicle Marker */}
      <Marker 
        position={currentPosition} 
        icon={createVehicleIcon(nav.heading)}
        zIndexOffset={1000}
      />
    </MapContainer>
  );
};
