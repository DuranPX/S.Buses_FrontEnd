// src/modules/incidents/components/IncidentCard.tsx
import { useState } from 'react';
import { incidentsService } from '../services/incidentsService';
import { showAlert } from '../../../shared/utils/alerts';
import type { Incidente, GravedadIncidente } from '../types/incident.types';

interface Props {
  incident: Incidente;
  isAdmin?: boolean;
  onStatusChange?: (id: string, estado: Incidente['estado']) => void;
  onUpdate?: (updated: Incidente) => void;
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

export const IncidentCard = ({ incident, isAdmin, onStatusChange, onUpdate }: Props) => {
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [nuevoComentario, setNuevoComentario]       = useState('');
  const [enviando, setEnviando]                     = useState(false);

  const dateStr = new Date(incident.fecha_reporte).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  const statusColor = estadoColor[incident.estado]    ?? '#94a3b8';
  const gColor      = gravedadColor[incident.gravedad] ?? '#94a3b8';
  const todasLasFotos = incident.incidenteBuses?.flatMap(ib => ib.fotos ?? []) ?? [];
  const [comentarios, setComentarios] = useState(incident.comentarios ?? []);

  const handleAddComentario = async () => {
    if (!nuevoComentario.trim()) return;
    setEnviando(true);
    try {
      const updated = await incidentsService.addComentario(incident.id, nuevoComentario);
      setComentarios(updated.comentarios ?? []);
      setNuevoComentario('');
      onUpdate?.(updated);
    } catch {
      showAlert.error('Error', 'No se pudo agregar el comentario');
    } finally {
      setEnviando(false);
    }
  };

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

        {/* Toggle comentarios */}
        <button
          onClick={() => setMostrarComentarios(prev => !prev)}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', padding: 0 }}
        >
          💬 {comentarios.length} comentario{comentarios.length !== 1 ? 's' : ''} {mostrarComentarios ? '▲' : '▼'}
        </button>

        {/* Comentarios */}
        {mostrarComentarios && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {/* Lista */}
            {comentarios.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                Sin comentarios aún.
              </p>
            ) : (
              comentarios.map((c, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>{c.texto}</p>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {c.autor ? `${c.autor} · ` : ''}{new Date(c.fecha).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}

            {/* Agregar comentario — solo admin */}
            {isAdmin && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={nuevoComentario}
                  onChange={e => setNuevoComentario(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComentario()}
                  placeholder="Agregar comentario de seguimiento..."
                  style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem' }}
                />
                <button
                  onClick={handleAddComentario}
                  disabled={enviando || !nuevoComentario.trim()}
                  style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '0.5rem', cursor: enviando ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, opacity: enviando ? 0.7 : 1 }}
                >
                  {enviando ? '...' : 'Enviar'}
                </button>
              </div>
            )}
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