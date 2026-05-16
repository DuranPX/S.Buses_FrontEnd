import { useNavigate } from 'react-router-dom';
import { useRoutes } from '../../../routes/hooks/useRoutes';
import { routesService } from '../../../routes/services/routesService';
import { Loader } from '../../../../shared/components/ui/Loader';

const AdminRoutesPage = () => {
  const navigate = useNavigate();
  const { routes, isLoading, error, refetch } = useRoutes();

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la ruta "${name}"?`)) return;
    try {
      await routesService.delete(id);
      refetch();
    } catch {
      alert('Error al eliminar la ruta.');
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            Gestión de Rutas
          </h1>
          <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
            Administra el trazado, paraderos y datos de las rutas.
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin/rutas/crear')}
          style={{ background: '#10b981', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          + Nueva Ruta
        </button>
      </div>

      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader /></div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem' }}>Código</th>
                <th style={{ padding: '1rem' }}>Nombre</th>
                <th style={{ padding: '1rem' }}>Tarifa</th>
                <th style={{ padding: '1rem' }}>Estado</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {routes.map(route => (
                <tr key={route.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#6366f1' }}>{route.codigo}</td>
                  <td style={{ padding: '1rem' }}>{route.nombre}</td>
                  <td style={{ padding: '1rem' }}>${route.tarifa.toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', background: route.estado ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: route.estado ? '#34d399' : '#f87171' }}>
                      {route.estado ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => navigate(`/rutas/${route.id}`)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#cbd5e1', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }} title="Ver">👁️</button>
                      <button onClick={() => handleDelete(route.id, route.nombre)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }} title="Eliminar">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {routes.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No hay rutas registradas.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRoutesPage;
