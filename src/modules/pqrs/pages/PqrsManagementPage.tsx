import { useState, useMemo, useCallback, useEffect } from 'react';
import { pqrsService } from '../services/pqrs.service';
import type { PQRS, PqrsFoto, CambiarEstadoPQRSRequest } from '../types/pqrs.types';
import { showAlert } from '../../../shared/utils/alerts';
import { Button } from '../../../shared/components/ui/Button';

// ── Constantes ───────────────────────────────────────────────────
const ESTADOS_VALIDOS = ['Recibido', 'En revisión', 'En proceso', 'Resuelto'] as const;
type EstadoPQRS = (typeof ESTADOS_VALIDOS)[number];

const FILTROS_ESTADO = ['Todos', ...ESTADOS_VALIDOS] as const;
type FiltroEstado = (typeof FILTROS_ESTADO)[number];

const estadoBadge: Record<string, { bg: string; color: string }> = {
  'Recibido':     { bg: 'rgba(234,179,8,0.15)',  color: '#eab308' },
  'En revisión':  { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  'En proceso':   { bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
  'Resuelto':     { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
};

function getBadgeStyle(estado: string) {
  return estadoBadge[estado] ?? estadoBadge['Recibido'];
}

function formatFecha(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// ── Subcomponente: Badge de estado ────────────────────────────────
const EstadoBadge = ({ estado }: { estado: string }) => {
  const { bg, color } = getBadgeStyle(estado);
  return (
    <span style={{
      display: 'inline-block',
      background: bg,
      color,
      padding: '0.2rem 0.7rem',
      borderRadius: '24px',
      fontSize: '0.75rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      {estado}
    </span>
  );
};

// ── Subcomponente: Inline Loader ──────────────────────────────────
const InlineLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', gap: '0.75rem' }}>
    <div style={{
      width: '36px', height: '36px',
      border: '3px solid rgba(255,255,255,0.1)',
      borderTop: '3px solid var(--accent-color, #3b82f6)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
    <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cargando PQRS...</span>
  </div>
);

// ── Subcomponente: Panel de detalle (slide-in) ────────────────────
interface DetailPanelProps {
  pqrs: PQRS;
  onClose: () => void;
  onEstadoCambiado: () => void;
}

const DetailPanel = ({ pqrs, onClose, onEstadoCambiado }: DetailPanelProps) => {
  const [nuevoEstado, setNuevoEstado] = useState<EstadoPQRS>(
    ESTADOS_VALIDOS.includes(pqrs.estado as EstadoPQRS) ? (pqrs.estado as EstadoPQRS) : 'Recibido'
  );
  const [respuesta, setRespuesta] = useState(pqrs.respuesta ?? '');
  const [loadingSave, setLoadingSave] = useState(false);
  const [errorRespuesta, setErrorRespuesta] = useState('');

  const requiereRespuesta = nuevoEstado === 'Resuelto';

  const guardarCambios = async () => {
    if (requiereRespuesta && !respuesta.trim()) {
      setErrorRespuesta('La respuesta final es obligatoria para marcar como Resuelto.');
      return;
    }
    setErrorRespuesta('');

    const dto: CambiarEstadoPQRSRequest = {
      estado: nuevoEstado,
      respuesta: respuesta.trim() || undefined,
      emailContacto: pqrs.emailContacto,
    };

    try {
      setLoadingSave(true);
      await pqrsService.cambiarEstado(pqrs.radicado, dto);
      showAlert.success('Estado actualizado', `La PQRS "${pqrs.radicado}" ahora está en estado "${nuevoEstado}".`);
      onEstadoCambiado();
    } catch (err: unknown) {
      console.error(err);
      let msg = 'No se pudo actualizar el estado. Intenta de nuevo.';
      if (err && typeof err === 'object' && 'response' in err) {
        const ax = err as { response: { status: number; data?: { message?: string } } };
        if (ax.response?.status === 400) msg = ax.response.data?.message || 'Datos inválidos.';
        if (ax.response?.status === 404) msg = 'PQRS no encontrada.';
      }
      showAlert.error('Error al actualizar', msg);
    } finally {
      setLoadingSave(false);
    }
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.55rem 0.9rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: 'inherit',
    fontSize: '0.9rem',
    appearance: 'none',
  };

  const labelMuted: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.3rem',
    display: 'block',
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
          zIndex: 1000,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: 0, right: 0,
        width: 'min(520px, 95vw)',
        height: '100vh',
        background: 'var(--surface, #0f172a)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.25s ease',
      }}>
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Detalle PQRS
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{pqrs.radicado}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <EstadoBadge estado={pqrs.estado} />
            <button
              id="panel-cerrar"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.4rem 0.7rem',
                fontSize: '1rem',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Datos principales */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Tipo', value: pqrs.tipo },
              { label: 'Categoría', value: pqrs.categoria },
              { label: 'Correo', value: pqrs.emailContacto },
              { label: 'Tiempo estimado', value: pqrs.tiempoEstimado ?? '—' },
              { label: 'Departamento', value: pqrs.departamento ?? '—' },
              { label: 'Fecha de creación', value: formatFecha(pqrs.creadoEn) },
            ].map(({ label, value }) => (
              <div key={label}>
                <span style={labelMuted}>{label}</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Descripción */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem' }}>
            <span style={labelMuted}>Descripción</span>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.65, color: '#cbd5e1' }}>
              {pqrs.descripcion}
            </p>
          </div>

          {/* Fotos */}
          {pqrs.fotos && pqrs.fotos.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem' }}>
              <span style={labelMuted}>Fotografías adjuntas ({pqrs.fotos.length})</span>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {(pqrs.fotos as PqrsFoto[]).map((foto) => (
                  <a
                    key={foto.id}
                    href={pqrsService.obtenerFotoUrl(pqrs.id!, foto.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={foto.nombreOriginal}
                    style={{ display: 'block', flexShrink: 0 }}
                  >
                    <img
                      src={pqrsService.obtenerFotoUrl(pqrs.id!, foto.id)}
                      alt={foto.nombreOriginal}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.12)',
                        transition: 'opacity 0.2s, transform 0.2s',
                        cursor: 'pointer',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Respuesta actual */}
          {pqrs.respuesta && (
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              paddingTop: '1.25rem',
              background: 'rgba(59,130,246,0.06)',
              borderRadius: '10px',
              padding: '1rem',
            }}>
              <span style={{ ...labelMuted, color: '#3b82f6' }}>Respuesta del agente</span>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.65, color: '#cbd5e1' }}>
                {pqrs.respuesta}
              </p>
            </div>
          )}

          {/* ── Sección de gestión ── */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem' }}>
            <span style={{ ...labelMuted, color: '#a5b4fc' }}>Gestión del estado</span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label htmlFor="select-nuevo-estado" style={labelMuted}>Nuevo estado</label>
                <select
                  id="select-nuevo-estado"
                  value={nuevoEstado}
                  onChange={(e) => {
                    setNuevoEstado(e.target.value as EstadoPQRS);
                    if (e.target.value !== 'Resuelto') setErrorRespuesta('');
                  }}
                  style={selectStyle}
                >
                  {ESTADOS_VALIDOS.filter((s) => s !== 'Recibido').map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Textarea de respuesta (aparece al seleccionar Resuelto) */}
              <div style={{
                overflow: 'hidden',
                maxHeight: requiereRespuesta ? '200px' : '0px',
                opacity: requiereRespuesta ? 1 : 0,
                transition: 'max-height 0.3s ease, opacity 0.25s ease',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label htmlFor="textarea-respuesta" style={labelMuted}>
                    Respuesta final <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    id="textarea-respuesta"
                    rows={4}
                    placeholder="Redacta la respuesta al ciudadano..."
                    value={respuesta}
                    onChange={(e) => {
                      setRespuesta(e.target.value);
                      if (e.target.value.trim()) setErrorRespuesta('');
                    }}
                    style={{
                      ...selectStyle,
                      resize: 'vertical',
                      borderColor: errorRespuesta ? '#ef4444' : 'rgba(255,255,255,0.12)',
                    }}
                  />
                  {errorRespuesta && (
                    <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errorRespuesta}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'flex-end',
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'var(--text-muted)',
              borderRadius: '8px',
              padding: '0.55rem 1.1rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Cancelar
          </button>
          <Button
            id="btn-guardar-estado"
            label={loadingSave ? 'Guardando...' : 'Guardar cambios'}
            onClick={guardarCambios}
            disabled={loadingSave || nuevoEstado === pqrs.estado}
          />
        </div>
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// Página principal de gestión para asesores
// ════════════════════════════════════════════════════════════════
export default function PqrsManagementPage() {
  const [pqrsList, setPqrsList] = useState<PQRS[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [cargado, setCargado] = useState(false);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('Todos');
  const [pqrsSeleccionada, setPqrsSeleccionada] = useState<PQRS | null>(null);

  // ── Cargar PQRS ─────────────────────────────────────────────
  const cargarPQRS = useCallback(async () => {
    try {
      setLoading(true);
      setErrorCarga(null);
      const data = await pqrsService.consultar_todos();
      setPqrsList(data);
      setCargado(true);
    } catch (err: unknown) {
      console.error(err);
      let msg = 'No se pudo cargar la lista de PQRS.';
      if (err && typeof err === 'object' && 'response' in err) {
        const ax = err as { response: { status: number; data?: { message?: string } } };
        if (ax.response?.status === 403) msg = 'No tienes permisos para ver las PQRS.';
        if (ax.response?.status === 500) msg = 'Error interno del servidor.';
      }
      setErrorCarga(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga automática al montar
  useEffect(() => {
    cargarPQRS();
  }, [cargarPQRS]);

  // ── Filtrado reactivo ────────────────────────────────────────
  const pqrsFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return pqrsList.filter((p) => {
      const matchEstado = filtroEstado === 'Todos' || p.estado === filtroEstado;
      const matchTexto =
        !texto ||
        p.radicado.toLowerCase().includes(texto) ||
        p.emailContacto.toLowerCase().includes(texto);
      return matchEstado && matchTexto;
    });
  }, [pqrsList, busqueda, filtroEstado]);

  // ── Estadísticas rápidas ──────────────────────────────────────
  const stats = useMemo(() => ({
    total: pqrsList.length,
    recibido: pqrsList.filter((p) => p.estado === 'Recibido').length,
    enProceso: pqrsList.filter((p) => p.estado === 'En proceso' || p.estado === 'En revisión').length,
    resuelto: pqrsList.filter((p) => p.estado === 'Resuelto').length,
  }), [pqrsList]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleEstadoCambiado = useCallback(() => {
    setPqrsSeleccionada(null);
    cargarPQRS();
  }, [cargarPQRS]);

  // ── Estilos ─────────────────────────────────────────────────
  const thStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--text-muted)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '0.85rem 1rem',
    fontSize: '0.875rem',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    verticalAlign: 'middle',
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>

      {/* ── Encabezado ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>Gestión de PQRS</h1>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Visualiza, filtra y actualiza el estado de todas las solicitudes ciudadanas.
          </p>
        </div>
        <Button id="btn-refrescar" label="↻ Refrescar" onClick={cargarPQRS} disabled={loading} />
      </div>

      {/* ── Stats ── */}
      {cargado && !errorCarga && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Total',       value: stats.total,    color: '#a5b4fc', bg: 'rgba(99,102,241,0.1)' },
            { label: 'Recibidas',   value: stats.recibido, color: '#eab308', bg: 'rgba(234,179,8,0.1)'  },
            { label: 'En progreso', value: stats.enProceso,color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
            { label: 'Resueltas',   value: stats.resuelto, color: '#22c55e', bg: 'rgba(34,197,94,0.1)'  },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{
              background: bg,
              border: `1px solid ${color}30`,
              borderRadius: '0.75rem',
              padding: '0.85rem 1rem',
              display: 'flex', flexDirection: 'column', gap: '0.2rem',
            }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Barra de búsqueda y filtros ── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          id="pqrs-busqueda"
          type="text"
          placeholder="🔍 Buscar por radicado o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            flex: '1 1 240px',
            padding: '0.55rem 0.9rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.05)',
            color: 'inherit',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />

        {/* Filtros de estado */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '8px', flexWrap: 'wrap' }}>
          {FILTROS_ESTADO.map((f) => (
            <button
              key={f}
              id={`filtro-${f.toLowerCase().replace(/ /g, '-')}`}
              onClick={() => setFiltroEstado(f)}
              style={{
                background: filtroEstado === f ? 'rgba(99,102,241,0.25)' : 'transparent',
                color: filtroEstado === f ? '#a5b4fc' : 'var(--text-muted)',
                border: filtroEstado === f ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8rem',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Indicador de resultados filtrados */}
        {(busqueda || filtroEstado !== 'Todos') && (
          <>
            <span style={{
              background: 'rgba(99,102,241,0.15)',
              color: '#a5b4fc',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '999px',
              padding: '0.3rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}>
              {pqrsFiltradas.length} resultado{pqrsFiltradas.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => { setBusqueda(''); setFiltroEstado('Todos'); }}
              style={{
                background: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.35rem 0.7rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.78rem',
              }}
            >
              ✕ Limpiar
            </button>
          </>
        )}
      </div>

      {/* ── Contenido principal ── */}
      {loading ? (
        <InlineLoader />
      ) : errorCarga ? (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          color: '#ef4444',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</div>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Error al cargar</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>{errorCarga}</div>
          <button
            onClick={cargarPQRS}
            style={{
              marginTop: '1rem',
              background: 'rgba(239,68,68,0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.3)',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            Reintentar
          </button>
        </div>
      ) : !cargado || pqrsFiltradas.length === 0 ? (
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '14px',
          padding: '4rem 2rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
            {busqueda || filtroEstado !== 'Todos' ? '🔍' : '📋'}
          </div>
          <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
            {busqueda || filtroEstado !== 'Todos' ? 'Sin resultados para ese filtro' : 'No hay PQRS registradas'}
          </div>
          <div style={{ fontSize: '0.875rem' }}>
            {busqueda || filtroEstado !== 'Todos'
              ? 'Prueba con otro criterio de búsqueda.'
              : 'Cuando los ciudadanos envíen solicitudes, aparecerán aquí.'}
          </div>
        </div>
      ) : (
        /* ── Tabla de PQRS ── */
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <th style={thStyle}>Radicado</th>
                  <th style={thStyle}>Tipo</th>
                  <th style={thStyle}>Categoría</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Correo</th>
                  <th style={thStyle}>Fecha</th>
                  <th style={thStyle}>T. Estimado</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pqrsFiltradas.map((p) => (
                  <tr
                    key={p.id ?? p.radicado}
                    style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.035)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={tdStyle}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', color: '#a5b4fc' }}>
                        {p.radicado}
                      </span>
                    </td>
                    <td style={tdStyle}>{p.tipo}</td>
                    <td style={tdStyle}>{p.categoria}</td>
                    <td style={tdStyle}><EstadoBadge estado={p.estado} /></td>
                    <td style={{ ...tdStyle, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span title={p.emailContacto}>{p.emailContacto}</span>
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{formatFecha(p.creadoEn)}</td>
                    <td style={tdStyle}>{p.tiempoEstimado ?? '—'}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <button
                        id={`btn-ver-${p.radicado}`}
                        onClick={() => setPqrsSeleccionada(p)}
                        style={{
                          background: 'rgba(99,102,241,0.15)',
                          color: '#a5b4fc',
                          border: '1px solid rgba(99,102,241,0.3)',
                          padding: '0.35rem 0.85rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          transition: 'all 0.15s',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(99,102,241,0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(99,102,241,0.15)';
                        }}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Panel de detalle (slide-in) ── */}
      {pqrsSeleccionada && (
        <DetailPanel
          pqrs={pqrsSeleccionada}
          onClose={() => setPqrsSeleccionada(null)}
          onEstadoCambiado={handleEstadoCambiado}
        />
      )}
    </div>
  );
}
