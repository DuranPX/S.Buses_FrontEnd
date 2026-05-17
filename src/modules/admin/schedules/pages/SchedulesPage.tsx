import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { schedulesService, type Programacion } from '../services/schedulesService';
import { Loader } from '../../../../shared/components/ui/Loader';

const SchedulesPage = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Programacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const data = await schedulesService.getAll();
        setSchedules(data);
      } catch (err: any) {
        setError('No se pudieron cargar las programaciones.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            Programaciones
          </h1>
          <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
            Asignación de buses, conductores y rutas a horarios específicos.
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin/programaciones/crear')}
          style={{ background: '#6366f1', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          + Nueva Programación
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader /></div>
      ) : error ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem' }}>{error}</div>
      ) : schedules.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <p>No hay programaciones registradas.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', overflow: 'hidden' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1rem' }}>Ruta</th>
                <th style={{ padding: '1rem' }}>Bus</th>
                <th style={{ padding: '1rem' }}>Fecha</th>
                <th style={{ padding: '1rem' }}>Salida</th>
                <th style={{ padding: '1rem' }}>Estado</th>
                <th style={{ padding: '1rem' }}>Pasajeros</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600 }}>{p.ruta?.codigo}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.ruta?.nombre}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>{p.bus?.placa}</td>
                  <td style={{ padding: '1rem' }}>{p.fecha}</td>
                  <td style={{ padding: '1rem' }}>{p.hora_salida}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', 
                      background: p.estado === 'En_Curso' ? 'rgba(52,211,153,0.1)' : 'rgba(99,102,241,0.1)',
                      color: p.estado === 'En_Curso' ? '#34d399' : '#a5b4fc',
                      border: `1px solid ${p.estado === 'En_Curso' ? '#34d399' : '#a5b4fc'}`
                    }}>
                      {p.estado}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{p.pasajeros_actuales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SchedulesPage;
