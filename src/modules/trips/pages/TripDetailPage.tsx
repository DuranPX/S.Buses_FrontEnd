import { useParams, useNavigate } from 'react-router-dom';
import { useTripDetail } from '../hooks/useTripDetail';
import { TripTimeline } from '../components/TripTimeline';
import { Loader } from '../../../shared/components/ui/Loader';

const TripDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trip, isLoading, error } = useTripDetail(id);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '60vh' }}>
        <Loader />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1.5rem', borderRadius: '0.5rem', display: 'inline-block' }}>
          <h3>Algo salió mal</h3>
          <p>{error || 'Viaje no encontrado.'}</p>
          <button onClick={() => navigate('/viajes/historial')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Volver</button>
        </div>
      </div>
    );
  }

  const dateStr = new Date(trip.fecha_descenso).toLocaleDateString('es-CO', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', height: '100%' }}>
      <button 
        onClick={() => navigate('/viajes/historial')}
        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        ← Volver al historial
      </button>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', overflow: 'hidden' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Detalle de Viaje
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', textTransform: 'capitalize' }}>{dateStr}</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '0.2rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.85rem' }}>
                {trip.ruta_codigo}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '0.2rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.85rem' }}>
                {trip.ruta_nombre}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Pagado</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#34d399' }}>
              ${trip.tarifa_pagada.toLocaleString('es-CO')}
            </div>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          <TripTimeline trip={trip} />
        </div>
        
        <div style={{ padding: '1rem 2rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
          <span>ID: {trip.id}</span>
        </div>
      </div>
    </div>
  );
};

export default TripDetailPage;
