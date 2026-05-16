import { useParams, useNavigate } from 'react-router-dom';
import { useRouteDetails } from '../hooks/useRouteDetails';
import { useRouteSocket } from '../hooks/useRouteSocket';
import { RouteMap } from '../components/RouteMap';
import { StopTimeline } from '../components/StopTimeline';
import { RouteRealtimePanel } from '../components/RouteRealtimePanel';
import { Loader } from '../../../shared/components/ui/Loader';

const RouteDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { route, isLoading, error } = useRouteDetails(id);
  const { activeBuses, hasDelay } = useRouteSocket(id);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '60vh' }}>
        <Loader />
      </div>
    );
  }

  if (error || !route) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1.5rem', borderRadius: '0.5rem', display: 'inline-block' }}>
          <h3>Algo salió mal</h3>
          <p>{error || 'No se encontró la ruta solicitada.'}</p>
          <button 
            onClick={() => navigate('/rutas')}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            Volver a Rutas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', padding: '1rem', gap: '1.5rem', overflow: 'hidden' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <button 
          onClick={() => navigate('/rutas')}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          title="Volver"
        >
          ←
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ background: '#6366f1', padding: '0.2rem 0.6rem', borderRadius: '0.4rem', fontSize: '1rem' }}>
              {route.codigo}
            </span>
            {route.nombre}
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Tarifa: ${route.tarifa.toLocaleString('es-CO')} · Tiempo estimado: {route.tiempo_estimado_total} min
          </p>
        </div>
      </div>

      {/* Contenido Principal: Mapa + Panel Lateral */}
      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        
        {/* Izquierda: Mapa */}
        <div style={{ flex: 1, position: 'relative', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
          <RouteMap stops={route.paraderos} nodes={route.rutaNodos} activeBuses={activeBuses} />
        </div>

        {/* Derecha: Paneles de Info (Timeline + Realtime) */}
        <div style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.5rem', scrollbarWidth: 'thin' }}>
          
          <RouteRealtimePanel buses={activeBuses} hasDelay={hasDelay} />
          
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
              📍 Recorrido y Paraderos
            </h4>
            <StopTimeline stops={route.paraderos} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default RouteDetailPage;
