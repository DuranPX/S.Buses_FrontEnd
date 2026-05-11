import type { ActiveBusLocation } from '../types/route.types';

interface Props { buses: ActiveBusLocation[]; hasDelay: boolean; }

const occupancyColor = (current: number, total: number) => {
  const pct = current / total;
  if (pct < 0.5) return '#34d399';
  if (pct < 0.8) return '#fbbf24';
  return '#f87171';
};

const occupancyLabel = (current: number, total: number) => {
  const pct = current / total;
  if (pct < 0.5) return 'Disponible';
  if (pct < 0.8) return 'Medio';
  return 'Lleno';
};

export const RouteRealtimePanel = ({ buses, hasDelay }: Props) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1rem', padding: '1rem 1.25rem',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
      <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>🚌 Buses activos en ruta</h4>
      <span style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        fontSize: '0.72rem', color: '#34d399',
      }}>
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%', background: '#34d399',
          animation: 'pulse 1.5s infinite',
        }} />
        En vivo
      </span>
    </div>

    {hasDelay && (
      <div style={{
        background: 'rgba(251,191,36,0.1)', border: '1px solid #fbbf24',
        borderRadius: '0.5rem', padding: '0.4rem 0.75rem',
        fontSize: '0.8rem', color: '#fbbf24', marginBottom: '0.75rem',
      }}>
        ⚠️ Retraso reportado en esta ruta
      </div>
    )}

    {buses.length === 0 ? (
      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.83rem' }}>Sin buses activos en este momento.</p>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {buses.map(bus => {
          const color = occupancyColor(bus.pasajeros_actuales, bus.capacidad_total);
          const pct = Math.round((bus.pasajeros_actuales / bus.capacidad_total) * 100);
          return (
            <div key={bus.bus_id} style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: '0.6rem', padding: '0.6rem 0.75rem',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{bus.placa}</span>
                <span style={{ fontSize: '0.75rem', color, fontWeight: 600 }}>
                  {occupancyLabel(bus.pasajeros_actuales, bus.capacidad_total)} ({pct}%)
                </span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '999px', height: '5px' }}>
                <div style={{ width: `${pct}%`, background: color, borderRadius: '999px', height: '100%', transition: 'width 0.5s' }} />
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                {bus.pasajeros_actuales}/{bus.capacidad_total} pasajeros
              </p>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
