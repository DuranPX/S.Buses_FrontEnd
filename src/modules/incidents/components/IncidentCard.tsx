import type { Incident } from '../types/incident.types';

interface Props {
  incident: Incident;
  isAdmin?: boolean;
  onStatusChange?: (id: string, status: Incident['estado']) => void;
}

export const IncidentCard = ({ incident, isAdmin, onStatusChange }: Props) => {
  const dateStr = new Date(incident.fecha_reporte).toLocaleString('es-CO', { 
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
  });

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Reportado': return '#ef4444'; // Rojo
      case 'En_Revision': return '#f59e0b'; // Naranja
      case 'Resuelto': return '#10b981'; // Verde
      default: return '#94a3b8';
    }
  };

  const statusColor = getStatusColor(incident.estado);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${isAdmin && incident.estado === 'Reportado' ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '1rem',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>{dateStr}</span>
          <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>{incident.tipo.replace('_', ' ')}</h4>
          {isAdmin && (
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.25rem', display: 'block' }}>
              Reportado por: {incident.reportador_nombre || incident.reportador_id}
            </span>
          )}
        </div>
        <span style={{ background: `${statusColor}20`, color: statusColor, padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${statusColor}40` }}>
          {incident.estado.replace('_', ' ')}
        </span>
      </div>

      <div style={{ padding: '1.25rem', flex: 1 }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>
          "{incident.descripcion}"
        </p>

        {(incident.ruta_codigo || incident.bus_placa) && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            {incident.ruta_codigo && <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>{incident.ruta_codigo}</span>}
            {incident.bus_placa && <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>Bus: {incident.bus_placa}</span>}
          </div>
        )}

        {incident.evidencia_url && (
          <div style={{ marginTop: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Evidencia Adjunta:</span>
            <div style={{ width: '100%', height: '120px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src={incident.evidencia_url} alt="Evidencia del incidente" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        )}
      </div>

      {isAdmin && incident.estado !== 'Resuelto' && (
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem' }}>
          {incident.estado === 'Reportado' && (
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
