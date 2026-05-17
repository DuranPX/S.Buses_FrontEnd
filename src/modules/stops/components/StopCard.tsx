import type { NearbyStop } from '../types/stop.types';

interface Props {
  stop: NearbyStop;
  isSelected?: boolean;
  onClick?: () => void;
}

export const StopCard = ({ stop, isSelected, onClick }: Props) => {
  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isSelected ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '0.75rem', padding: '1rem',
        cursor: 'pointer', transition: 'all 0.2s',
      }}
      onMouseEnter={e => !isSelected && (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.2)')}
      onMouseLeave={e => !isSelected && (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{stop.nombre}</h4>
        <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, background: 'rgba(52,211,153,0.1)', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>
          {stop.distancia} m
        </span>
      </div>
      
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
        Tipo: {stop.tipo}
      </p>

      {stop.rutas.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {stop.rutas.map(ruta => (
            <span key={ruta} style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '0.15rem 0.4rem', borderRadius: '0.25rem' }}>
              {ruta}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
