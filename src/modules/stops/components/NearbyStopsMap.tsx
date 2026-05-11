import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CENTER, MAP_DEFAULT_ZOOM, TILE_LAYER_URL, TILE_LAYER_ATTRIBUTION, createStopIcon, createUserIcon } from '../../../maps/mapConfig';
import type { NearbyStop, Coordinates } from '../types/stop.types';

const AutoPan = ({ location }: { location: Coordinates | null }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], 15, { animate: true });
    }
  }, [location, map]);
  return null;
};

interface Props {
  stops: NearbyStop[];
  location: Coordinates | null;
  onStopClick?: (id: string) => void;
}

export const NearbyStopsMap = ({ stops, location, onStopClick }: Props) => {
  return (
    <div style={{ height: '100%', width: '100%', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
      <MapContainer 
        center={MAP_CENTER} 
        zoom={MAP_DEFAULT_ZOOM} 
        style={{ height: '100%', width: '100%', background: '#1e293b' }}
      >
        <TileLayer url={TILE_LAYER_URL} attribution={TILE_LAYER_ATTRIBUTION} />
        
        {/* Marcador del usuario */}
        {location && (
          <Marker position={[location.lat, location.lng]} icon={createUserIcon()}>
            <Popup>Tu ubicación actual</Popup>
          </Marker>
        )}

        {/* Marcadores de paraderos cercanos */}
        {stops.map(stop => (
          <Marker 
            key={stop.id} 
            position={[stop.latitud, stop.longitud]}
            icon={createStopIcon()}
            eventHandlers={{
              click: () => onStopClick?.(stop.id)
            }}
          >
            <Popup>
              <div style={{ color: '#0f172a' }}>
                <strong style={{ display: 'block', fontSize: '1rem' }}>{stop.nombre}</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{stop.distancia} km de ti</span>
              </div>
            </Popup>
          </Marker>
        ))}

        <AutoPan location={location} />
      </MapContainer>
    </div>
  );
};
