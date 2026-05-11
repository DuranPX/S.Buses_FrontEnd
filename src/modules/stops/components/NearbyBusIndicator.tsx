import type { NearbyBus } from '../hooks/useNearbySocket';

interface Props {
  buses: NearbyBus[];
}

export const NearbyBusIndicator = ({ buses }: Props) => {
  if (buses.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', padding: '1rem' }}>
        No hay buses acercándose a este paradero en los próximos 15 minutos.
      </div>
    );
  }

  const sorted = [...buses].sort((a, b) => a.tiempo_llegada - b.tiempo_llegada);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {sorted.map(bus => (
        <div key={bus.id} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.5rem',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#a5b4fc', marginRight: '0.5rem' }}>
              {bus.ruta_codigo}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Ocupación: {bus.ocupacion_pct}%
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong style={{ fontSize: '1.1rem', color: bus.tiempo_llegada <= 2 ? '#34d399' : 'white' }}>
              {bus.tiempo_llegada} min
            </strong>
          </div>
        </div>
      ))}
    </div>
  );
};
