import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stopsService } from '../../../stops/services/stopsService';
import type { Stop } from '../../../stops/types/stop.types';
import { Loader } from '../../../../shared/components/ui/Loader';

const AdminStopsPage = () => {
  const navigate = useNavigate();
  const [stops, setStops] = useState<Stop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    stopsService.getAll()
      .then(setStops)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            Gestión de Paraderos
          </h1>
          <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
            Administra los puntos de parada y su ubicación geográfica.
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin/paraderos/crear')}
          style={{ background: '#10b981', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          + Nuevo Paradero
        </button>
      </div>

      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader /></div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem' }}>ID (UUID)</th>
                <th style={{ padding: '1rem' }}>Código</th>
                <th style={{ padding: '1rem' }}>Nombre</th>
                <th style={{ padding: '1rem' }}>Ubicación</th>
                <th style={{ padding: '1rem' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {stops.map(stop => (
                <tr key={stop.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>{stop.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#6366f1' }}>{stop.codigo}</td>
                  <td style={{ padding: '1rem' }}>{stop.nombre}</td>
                  <td style={{ padding: '1rem', fontSize: '0.8rem' }}>
                    {typeof stop.latitud === 'number' ? stop.latitud.toFixed(4) : stop.latitud}, 
                    {typeof stop.longitud === 'number' ? stop.longitud.toFixed(4) : stop.longitud}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', background: stop.estado ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: stop.estado ? '#34d399' : '#f87171' }}>
                      {stop.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stops.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No hay paraderos registrados.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminStopsPage;
