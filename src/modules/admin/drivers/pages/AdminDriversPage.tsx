import { useState, useEffect } from 'react';
import { Loader } from '../../../../shared/components/ui/Loader';
import { driversMockService } from '../services/driversMockService';
import type { MockDriver } from '../services/driversMockService';

const AdminDriversPage = () => {
  const [drivers, setDrivers] = useState<MockDriver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const data = await driversMockService.getAll();
        setDrivers(data);
      } catch (err) {
        setError('Error al cargar la lista de conductores.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            Gestión de Conductores
          </h1>
          <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
            Listado y administración de todo el personal operativo (Mock).
          </p>
        </div>
        <button 
          onClick={() => alert('Abrir modal para crear nuevo conductor')}
          style={{ background: '#6366f1', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          + Nuevo Conductor
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
          <Loader />
        </div>
      ) : error ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
          {error}
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>NOMBRE COMPLETO</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>LICENCIA</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>EMPRESA</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>ESTADO</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>CALIFICACIÓN</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(driver => (
                <tr key={driver.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', color: '#f8fafc', fontWeight: 500 }}>
                    {driver.nombres} {driver.apellidos}
                  </td>
                  <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>{driver.licencia}</td>
                  <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>{driver.empresa_nombre || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                      background: driver.estado === 'Activo' ? 'rgba(16,185,129,0.2)' : driver.estado === 'Suspendido' ? 'rgba(239,68,68,0.2)' : 'rgba(148,163,184,0.2)',
                      color: driver.estado === 'Activo' ? '#10b981' : driver.estado === 'Suspendido' ? '#ef4444' : '#94a3b8',
                      border: `1px solid ${driver.estado === 'Activo' ? '#10b98140' : driver.estado === 'Suspendido' ? '#ef444440' : '#94a3b840'}`
                    }}>
                      {driver.estado}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ color: '#fbbf24' }}>★</span> {driver.calificacion?.toFixed(1) || '-'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDriversPage;
