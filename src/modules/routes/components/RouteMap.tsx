import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CENTER, MAP_DEFAULT_ZOOM, TILE_LAYER_URL, TILE_LAYER_ATTRIBUTION, createStopIcon, createBusIcon } from '../../../maps/mapConfig';
import type { RouteStop, ActiveBusLocation } from '../types/route.types';

// Componente auxiliar para ajustar los límites del mapa (bounds) a los paraderos
const MapBounds = ({ stops }: { stops: RouteStop[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!stops || stops.length === 0) return;
    
    // Necesitamos acceder a L global para instanciar LatLngBounds
    const L = (window as any).L;
    if (!L) return;

    const bounds = L.latLngBounds(stops.map(s => [s.paradero.latitud, s.paradero.longitud]));
    // Agregamos un poco de padding para que los marcadores no queden en el borde
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, stops]);

  return null;
};

interface Props {
  stops: RouteStop[];
  activeBuses: ActiveBusLocation[];
}

export const RouteMap = ({ stops, activeBuses }: Props) => {
  // Ordenar paraderos y extraer coordenadas para la línea (Polyline)
  const sortedStops = [...stops].sort((a, b) => a.orden - b.orden);
  const pathCoordinates = sortedStops.map(s => [s.paradero.latitud, s.paradero.longitud] as [number, number]);

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
      <MapContainer 
        center={MAP_CENTER} 
        zoom={MAP_DEFAULT_ZOOM} 
        style={{ height: '100%', width: '100%', background: '#1e293b' }}
      >
        <TileLayer url={TILE_LAYER_URL} attribution={TILE_LAYER_ATTRIBUTION} />
        
        {/* Línea que conecta los paraderos */}
        <Polyline positions={pathCoordinates} color="#6366f1" weight={4} opacity={0.8} />

        {/* Marcadores de Paraderos */}
        {sortedStops.map(rs => (
          <Marker 
            key={rs.paradero.id} 
            position={[rs.paradero.latitud, rs.paradero.longitud]}
            icon={createStopIcon(rs.orden)}
          >
            <Popup>
              <div style={{ color: '#0f172a' }}>
                <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '4px' }}>
                  {rs.orden}. {rs.paradero.nombre}
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{rs.paradero.tipo}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marcadores de Buses Activos */}
        {activeBuses.map(bus => (
          <Marker
            key={bus.bus_id}
            position={[bus.latitud, bus.longitud]}
            icon={createBusIcon()}
          >
            <Popup>
              <div style={{ color: '#0f172a', textAlign: 'center' }}>
                <strong style={{ display: 'block', fontSize: '1rem' }}>Bus {bus.placa}</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Ocupación: {bus.pasajeros_actuales}/{bus.capacidad_total}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Auto-ajustar vista */}
        <MapBounds stops={stops} />
      </MapContainer>
    </div>
  );
};
