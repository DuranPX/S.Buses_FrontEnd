import type { Trip } from '../types/trip.types';

interface Props {
  trip: Trip;
}

export const TripTimeline = ({ trip }: Props) => {
  const tAbordaje = new Date(trip.fecha_abordaje).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const tDescenso = new Date(trip.fecha_descenso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '1rem 0' }}>
      {/* Origen */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#10b981', border: '3px solid rgba(16,185,129,0.3)' }} />
          <div style={{ width: '2px', height: '50px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
        </div>
        <div style={{ flex: 1, paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>{trip.origen_nombre}</h4>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
              {tAbordaje}
            </span>
          </div>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Abordaje</p>
        </div>
      </div>

      {/* Info en ruta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '2rem', paddingBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px dashed rgba(255,255,255,0.1)', flex: 1, display: 'flex', justifyContent: 'space-around', color: '#94a3b8', fontSize: '0.8rem' }}>
          <span>⏱ {trip.duracion_minutos} min</span>
          {trip.distancia_km && <span>📏 {trip.distancia_km} km</span>}
        </div>
      </div>

      {/* Destino */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#f59e0b', border: '3px solid rgba(245,158,11,0.3)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>{trip.destino_nombre}</h4>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
              {tDescenso}
            </span>
          </div>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Descenso y Fin del viaje</p>
        </div>
      </div>
    </div>
  );
};
