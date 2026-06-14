// src/modules/routes/components/RouteRealtimePanel.tsx

import type { BusPosicion } from '../../../types/bus-tracking.types';
import { NivelRetraso } from '../../../types/bus-tracking.types';

interface Props {
  buses: BusPosicion[];
  hasDelay: boolean;
}

function formatEta(segundos: number): string {
  if (segundos < 60) return `${segundos} s`;
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return seg > 0 ? `${min} min ${seg} s` : `${min} min`;
}

function colorPorRetraso(nivel: NivelRetraso): string {
  switch (nivel) {
    case NivelRetraso.Critico:  return '#f87171';
    case NivelRetraso.Moderado: return '#fb923c';
    case NivelRetraso.Leve:     return '#fbbf24';
    default:                    return '#34d399';
  }
}

function etiquetaRetraso(nivel: NivelRetraso): string {
  switch (nivel) {
    case NivelRetraso.Critico:  return '🔴 Muy retrasado';
    case NivelRetraso.Moderado: return '🟠 Retrasado';
    case NivelRetraso.Leve:     return '🟡 Leve retraso';
    default:                    return '🟢 En tiempo';
  }
}

export const RouteRealtimePanel = ({ buses, hasDelay }: Props) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1rem',
    padding: '1rem 1.25rem',
  }}>
    {/* Encabezado */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
      <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>🚌 Buses activos en ruta</h4>
      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#34d399' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', animation: 'pulse 1.5s infinite' }} />
        En vivo
      </span>
    </div>

    {/* Alerta de retraso */}
    {hasDelay && (
      <div style={{
        background: 'rgba(251,191,36,0.1)',
        border: '1px solid #fbbf24',
        borderRadius: '0.5rem',
        padding: '0.4rem 0.75rem',
        fontSize: '0.8rem',
        color: '#fbbf24',
        marginBottom: '0.75rem',
      }}>
        ⚠️ Retraso reportado en esta ruta
      </div>
    )}

    {/* Lista de buses */}
    {buses.length === 0 ? (
      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.83rem' }}>Sin buses activos en este momento.</p>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {buses.map(bus => {
          const color = colorPorRetraso(bus.nivelRetraso);
          return (
            <div key={bus.busId} style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '0.6rem',
              padding: '0.6rem 0.75rem',
              border: `1px solid ${bus.nivelRetraso === NivelRetraso.Critico ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}>
              {/* Placa + estado de retraso */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{bus.placa}</span>
                <span style={{ fontSize: '0.72rem', color, fontWeight: 600 }}>
                  {etiquetaRetraso(bus.nivelRetraso)}
                </span>
              </div>

              {/* Paradero más cercano */}
              <p style={{ margin: '0 0 4px', fontSize: '0.78rem', color: '#94a3b8' }}>
                📍 {bus.paraderoCercano.nombre}
                <span style={{ color: '#64748b', marginLeft: '4px' }}>· {bus.paraderoCercano.distanciaMetros} m</span>
              </p>

              {/* ETA + ocupación */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: '#6366f1', fontWeight: 600 }}>
                  ⏱ ETA: {formatEta(bus.etaSegundos)}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {bus.ocupacionPorcentaje}% ocupado
                </span>
              </div>

              {/* Barra de ocupación */}
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '999px', height: '4px', marginTop: '6px' }}>
                <div style={{
                  width: `${bus.ocupacionPorcentaje}%`,
                  background: bus.ocupacionPorcentaje > 80 ? '#f87171' : '#6366f1',
                  borderRadius: '999px',
                  height: '100%',
                  transition: 'width 0.5s',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);