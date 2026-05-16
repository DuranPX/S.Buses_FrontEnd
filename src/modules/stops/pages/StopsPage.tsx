import { useState, useEffect } from 'react';
import { stopsService } from '../services/stopsService';
import type { Stop } from '../types/stop.types';
import { Loader } from '../../../shared/components/ui/Loader';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CENTER, TILE_LAYER_URL, TILE_LAYER_ATTRIBUTION, createStopIcon } from '../../../maps/mapConfig';
import { useNavigate } from 'react-router-dom';

const StopsPage = () => {
  const [stops, setStops] = useState<Stop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    stopsService.getAll()
      .then(data => setStops(data))
      .catch(() => setError('Error al cargar la red de paraderos.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', padding: '1rem', gap: '1.5rem', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Red de Paraderos</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Explora todos los paraderos del sistema.
          </p>
        </div>
        <button 
          onClick={() => navigate('/paradero/actual')}
          style={{ background: '#6366f1', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          📍 Ver paraderos cercanos
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Loader />
        </div>
      ) : error ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem' }}>
          {error}
        </div>
      ) : (
        <div style={{ flex: 1, borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <MapContainer 
            center={MAP_CENTER} 
            zoom={13} 
            style={{ height: '100%', width: '100%', background: '#1e293b' }}
          >
            <TileLayer url={TILE_LAYER_URL} attribution={TILE_LAYER_ATTRIBUTION} />
            
            {stops.map(stop => (
              <Marker 
                key={stop.id} 
                position={[stop.latitud, stop.longitud]}
                icon={createStopIcon()}
              >
                <Popup>
                  <div style={{ color: '#0f172a' }}>
                    <strong style={{ display: 'block', fontSize: '1rem' }}>{stop.nombre}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{stop.tipo}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default StopsPage;
