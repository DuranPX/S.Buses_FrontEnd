// src/modules/incidents/components/IncidentCard.tsx
import type { Incidente, GravedadIncidente } from '../types/incident.types';

interface Props {
  incident: Incidente;
  isAdmin?: boolean;
  onStatusChange?: (id: string, estado: Incidente['estado']) => void;
}

const estadoColor: Record<string, string> = {
  Pendiente:   '#ef4444',
  En_Revision: '#f59e0b',
  Resuelto:    '#10b981',
};

const gravedadColor: Record<GravedadIncidente, string> = {
  Bajo:    '#22c55e',
  Medio:   '#f59e0b',
  Alto:    '#f97316',
  Crítico: '#ef4444',
};

export const IncidentCard = ({ incident, isAdmin, onStatusChange }: Props) => {
  const dateStr = new Date(incident.fecha_reporte).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  const statusColor  = estadoColor[incident.estado]  ?? '#94a3b8';
  const gColor       = gravedadColor[incident.gravedad] ?? '#94a3b8';

  // Fotos de todos los incidenteBus asociados
  const todasLasFotos = incident.incidenteBuses?.flatMap(ib => ib.fotos ?? []) ?? [];

  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${isAdmin && incident.estado === 'Pendiente' ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{dateStr}</span>
          <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>{incident.tipo}</h4>
          <span style={{ fontSize: '0.8rem', color: gColor, fontWeight: 600 }}>
            ⚠️ Gravedad: {incident.gravedad}
          </span>
          {incident.incidenteBuses?.map(ib => (
            <span key={ib.id} style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              🚌 Bus: {ib.bus.placa} — {ib.bus.modelo}
            </span>
          ))}
        </div>
        <span style={{ background: `${statusColor}20`, color: statusColor, padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${statusColor}40`, whiteSpace: 'nowrap' }}>
          {incident.estado.replace('_', ' ')}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {incident.descripcion && (
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            "{incident.descripcion}"
          </p>
        )}

        {/* Fotos */}
        {todasLasFotos.length > 0 && (
          <div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
              Evidencia ({todasLasFotos.length} foto{todasLasFotos.length > 1 ? 's' : ''})
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem' }}>
              {todasLasFotos.map(foto => (
                <div key={foto.id} style={{ aspectRatio: '1', borderRadius: '0.4rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={foto.url} alt="Evidencia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Acciones admin */}
      {isAdmin && incident.estado !== 'Resuelto' && (
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem' }}>
          {incident.estado === 'Pendiente' && (
            <button
              onClick={() => onStatusChange?.(incident.id, 'En_Revision')}
              style={{ flex: 1, background: '#f59e0b', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
            >
              Marcar En Revisión
            </button>
          )}
          <button
            onClick={() => onStatusChange?.(incident.id, 'Resuelto')}
            style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
          >
            Marcar Resuelto
          </button>
        </div>
      )}
    </div>
  );
};