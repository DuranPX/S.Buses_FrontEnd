import { useState, useRef } from 'react';
import { pqrsService } from '../services/pqrs.service';
import type { CrearPQRSRequest, PQRS } from '../types/pqrs.types';
import { FormCard } from '../../../shared/components/cards/FormCard';
import InputField from '../../../shared/components/forms/InputField';
import { Button } from '../../../shared/components/ui/Button';
import { showAlert } from '../../../shared/utils/alerts';

// ── Constantes ───────────────────────────────────────────────────
const MAX_FOTOS = 3;
const MAX_SIZE_MB = 5;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIPOS_VALIDOS = ['Petición', 'Queja', 'Reclamo', 'Sugerencia'] as const;
const CATEGORIAS_VALIDAS = ['Conductor', 'Bus', 'Ruta', 'Tarjeta', 'Otro'] as const;

type TipoPQRS = (typeof TIPOS_VALIDOS)[number];
type CategoriaPQRS = (typeof CATEGORIAS_VALIDAS)[number];

// ── Colores de estado ─────────────────────────────────────────────
const estadoColor: Record<string, { bg: string; text: string }> = {
  recibido:      { bg: 'rgba(234,179,8,0.1)',  text: '#eab308' },
  'en revisión': { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6' },
  'en proceso':  { bg: 'rgba(168,85,247,0.1)', text: '#a855f7' },
  resuelto:      { bg: 'rgba(34,197,94,0.1)',  text: '#22c55e' },
};

function getEstadoStyle(estado: string) {
  return estadoColor[estado?.toLowerCase()] ?? estadoColor['recibido'];
}

// ── Resolver errores HTTP a mensajes amigables ────────────────────
function resolverMensajeError(error: unknown): { titulo: string; texto: string } {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosErr = error as {
      response: { status: number; data?: { message?: string; error?: string } };
    };
    const status = axiosErr.response?.status;
    const backendMsg =
      axiosErr.response?.data?.message ||
      axiosErr.response?.data?.error ||
      '';

    switch (status) {
      case 400:
        return {
          titulo: 'Datos inválidos',
          texto: backendMsg || 'Revisa los campos del formulario e intenta nuevamente.',
        };
      case 409:
        return {
          titulo: 'Solicitud duplicada',
          texto: backendMsg || 'Ya existe una PQRS registrada con esos datos.',
        };
      case 413:
        return {
          titulo: 'Imágenes demasiado grandes',
          texto: `Una o más imágenes superan el tamaño máximo de ${MAX_SIZE_MB} MB.`,
        };
      case 500:
        return {
          titulo: 'Error del servidor',
          texto: 'Ocurrió un problema interno. Intenta más tarde.',
        };
      default:
        return {
          titulo: 'Error inesperado',
          texto: backendMsg || 'No se pudo completar la operación. Intenta más tarde.',
        };
    }
  }
  return {
    titulo: 'Error de conexión',
    texto: 'No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.',
  };
}

// ════════════════════════════════════════════════════════════════
export default function PQRSPage() {
  const [activeTab, setActiveTab] = useState<'crear' | 'consultar'>('crear');

  const [form, setForm] = useState<CrearPQRSRequest>({
    tipo: 'Petición' as TipoPQRS,
    categoria: 'Otro' as CategoriaPQRS,
    descripcion: '',
    emailContacto: '',
  });

  // Errores de validación inline
  const [errores, setErrores] = useState<{
    emailContacto?: string;
    descripcion?: string;
    tipo?: string;
    categoria?: string;
  }>({});

  const [fotos, setFotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [radicadoBusqueda, setRadicadoBusqueda] = useState('');
  const [pqrs, setPqrs] = useState<PQRS | null>(null);
  const [loadingCrear, setLoadingCrear] = useState(false);
  const [loadingConsultar, setLoadingConsultar] = useState(false);

  // ── Validaciones ─────────────────────────────────────────────
  const validarCampo = (campo: keyof typeof errores, valor: string): boolean => {
    let msg = '';
    if (campo === 'emailContacto') {
      if (!valor.trim()) msg = 'El correo es obligatorio.';
      else if (!EMAIL_REGEX.test(valor)) msg = 'Ingresa un correo electrónico válido.';
    }
    if (campo === 'descripcion') {
      if (!valor.trim()) msg = 'La descripción es obligatoria.';
      else if (valor.length > 500) msg = 'La descripción no puede superar los 500 caracteres.';
    }
    if (campo === 'tipo' && !TIPOS_VALIDOS.includes(valor as TipoPQRS)) {
      msg = 'Selecciona un tipo de solicitud válido.';
    }
    if (campo === 'categoria' && !CATEGORIAS_VALIDAS.includes(valor as CategoriaPQRS)) {
      msg = 'Selecciona una categoría válida.';
    }
    setErrores((prev) => ({ ...prev, [campo]: msg }));
    return msg === '';
  };

  const validarFormulario = (): boolean => {
    const v1 = validarCampo('emailContacto', form.emailContacto);
    const v2 = validarCampo('descripcion', form.descripcion);
    const v3 = validarCampo('tipo', form.tipo);
    const v4 = validarCampo('categoria', form.categoria);
    return v1 && v2 && v3 && v4;
  };

  // ── Manejo de fotos ──────────────────────────────────────────
  const handleFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(e.target.files ?? []);
    const disponibles = MAX_FOTOS - fotos.length;

    if (disponibles <= 0) {
      showAlert.warning('Límite alcanzado', `Máximo ${MAX_FOTOS} fotos permitidas.`);
      return;
    }

    const validas: File[] = [];
    for (const archivo of archivos.slice(0, disponibles)) {
      if (!archivo.type.startsWith('image/')) {
        showAlert.error('Archivo inválido', `"${archivo.name}" no es una imagen.`);
        continue;
      }
      if (archivo.size > MAX_SIZE_MB * 1024 * 1024) {
        showAlert.error('Archivo muy grande', `"${archivo.name}" supera ${MAX_SIZE_MB} MB.`);
        continue;
      }
      validas.push(archivo);
    }

    if (validas.length === 0) return;

    const nuevasPreviews = validas.map((f) => URL.createObjectURL(f));
    setFotos((prev) => [...prev, ...validas]);
    setPreviews((prev) => [...prev, ...nuevasPreviews]);

    // Reset para permitir volver a seleccionar el mismo archivo
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const eliminarFoto = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Crear PQRS ───────────────────────────────────────────────
  const crearPQRS = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      showAlert.warning('Formulario incompleto', 'Corrige los errores indicados antes de continuar.');
      return;
    }

    try {
      setLoadingCrear(true);
      const response = await pqrsService.crear({ ...form, fotos });

      showAlert.success(
        '¡Solicitud Recibida!',
        response.radicado
          ? `Tu número de radicado es: ${response.radicado}. Guárdalo para futuras consultas.`
          : 'Tu solicitud ha sido radicada con éxito.',
      );

      // Limpiar formulario
      setForm({ tipo: 'Petición', categoria: 'Otro', descripcion: '', emailContacto: '' });
      setErrores({});
      previews.forEach((p) => URL.revokeObjectURL(p));
      setFotos([]);
      setPreviews([]);

      // Redirigir a consultar
      if (response.radicado) {
        setRadicadoBusqueda(response.radicado);
        setActiveTab('consultar');
        consultarPQRS(response.radicado);
      }
    } catch (error: unknown) {
      console.error(error);
      const { titulo, texto } = resolverMensajeError(error);
      showAlert.error(titulo, texto);
    } finally {
      setLoadingCrear(false);
    }
  };

  // ── Consultar PQRS ───────────────────────────────────────────
  const consultarPQRS = async (radicadoToSearch = radicadoBusqueda) => {
    if (!radicadoToSearch.trim()) {
      showAlert.warning('Atención', 'Ingresa un número de radicado válido');
      return;
    }
    try {
      setLoadingConsultar(true);
      const response = await pqrsService.consultar(radicadoToSearch);
      setPqrs(response);
    } catch (error: unknown) {
      console.error(error);
      const { titulo, texto } = resolverMensajeError(error);
      showAlert.error(titulo || 'No encontrada', texto);
      setPqrs(null);
    } finally {
      setLoadingConsultar(false);
    }
  };

  // ── Estilos compartidos ───────────────────────────────────────
  const selectStyle: React.CSSProperties = {
    padding: '0.6rem 0.9rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: 'inherit',
    fontSize: '0.9rem',
    appearance: 'none',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#ef4444',
    marginTop: '0.2rem',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.75rem 1.5rem',
    color: active ? 'var(--accent-color, #3b82f6)' : 'var(--text-muted)',
    fontWeight: active ? 600 : 400,
    borderBottom: active
      ? '2px solid var(--accent-color, #3b82f6)'
      : '2px solid transparent',
    transition: 'all 0.2s',
  });

  const formularioInvalido =
    loadingCrear ||
    !form.descripcion.trim() ||
    !EMAIL_REGEX.test(form.emailContacto);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Encabezado */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Atención al Ciudadano</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Envía tus peticiones, quejas, reclamos o sugerencias (PQRS) o consulta el estado de un radicado existente.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button id="tab-crear" onClick={() => setActiveTab('crear')} style={tabStyle(activeTab === 'crear')}>
          Radicar nueva PQRS
        </button>
        <button id="tab-consultar" onClick={() => setActiveTab('consultar')} style={tabStyle(activeTab === 'consultar')}>
          Consultar estado
        </button>
      </div>

      {/* ── TAB CREAR ── */}
      {activeTab === 'crear' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <FormCard title="Crear nueva PQRS">
            <form id="form-crear-pqrs" onSubmit={crearPQRS} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Tipo y Categoría */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label htmlFor="pqrs-tipo" style={labelStyle}>Tipo de Solicitud</label>
                  <select
                    id="pqrs-tipo"
                    value={form.tipo}
                    onChange={(e) => {
                      setForm({ ...form, tipo: e.target.value });
                      validarCampo('tipo', e.target.value);
                    }}
                    style={{
                      ...selectStyle,
                      borderColor: errores.tipo ? '#ef4444' : 'rgba(255,255,255,0.12)',
                    }}
                    required
                  >
                    {TIPOS_VALIDOS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errores.tipo && <span style={errorStyle}>{errores.tipo}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label htmlFor="pqrs-categoria" style={labelStyle}>Categoría</label>
                  <select
                    id="pqrs-categoria"
                    value={form.categoria}
                    onChange={(e) => {
                      setForm({ ...form, categoria: e.target.value });
                      validarCampo('categoria', e.target.value);
                    }}
                    style={{
                      ...selectStyle,
                      borderColor: errores.categoria ? '#ef4444' : 'rgba(255,255,255,0.12)',
                    }}
                    required
                  >
                    {CATEGORIAS_VALIDAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errores.categoria && <span style={errorStyle}>{errores.categoria}</span>}
                </div>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <InputField
                  id="pqrs-email"
                  label="Correo de Contacto"
                  type="email"
                  placeholder="Donde recibirás la confirmación"
                  value={form.emailContacto}
                  onChange={(e) => {
                    setForm({ ...form, emailContacto: e.target.value });
                    validarCampo('emailContacto', e.target.value);
                  }}
                  onBlur={(e) => validarCampo('emailContacto', e.target.value)}
                  required
                />
                {errores.emailContacto && <span style={errorStyle}>{errores.emailContacto}</span>}
              </div>

              {/* Descripción */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label htmlFor="pqrs-descripcion" style={labelStyle}>Descripción</label>
                <textarea
                  id="pqrs-descripcion"
                  rows={4}
                  maxLength={500}
                  placeholder="Detalla tu situación aquí (máx. 500 caracteres)..."
                  value={form.descripcion}
                  onChange={(e) => {
                    setForm({ ...form, descripcion: e.target.value });
                    validarCampo('descripcion', e.target.value);
                  }}
                  onBlur={(e) => validarCampo('descripcion', e.target.value)}
                  style={{
                    ...selectStyle,
                    resize: 'vertical',
                    borderColor: errores.descripcion ? '#ef4444' : 'rgba(255,255,255,0.12)',
                  }}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {errores.descripcion
                    ? <span style={errorStyle}>{errores.descripcion}</span>
                    : <span />
                  }
                  <span style={{ fontSize: '0.75rem', color: form.descripcion.length >= 480 ? '#f59e0b' : 'var(--text-muted)' }}>
                    {form.descripcion.length} / 500
                  </span>
                </div>
              </div>

              {/* Fotos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={labelStyle}>
                  Fotografías de evidencia{' '}
                  <span style={{ fontWeight: 400, textTransform: 'none' }}>
                    (opcional · máx. {MAX_FOTOS} fotos · {MAX_SIZE_MB} MB c/u)
                  </span>
                </label>

                {/* Previews con nombre y tamaño */}
                {previews.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {previews.map((src, i) => (
                      <div key={i} style={{ position: 'relative', width: '90px' }}>
                        <img
                          src={src}
                          alt={`Foto ${i + 1}`}
                          style={{
                            width: '90px',
                            height: '90px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            display: 'block',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => eliminarFoto(i)}
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            lineHeight: 1,
                          }}
                          title="Eliminar foto"
                        >
                          ✕
                        </button>
                        <div style={{ marginTop: '0.25rem' }}>
                          <span style={{
                            fontSize: '0.68rem',
                            color: 'var(--text-muted)',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {fotos[i]?.name}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                            {(fotos[i]?.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botón agregar fotos */}
                {fotos.length < MAX_FOTOS && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleFotos}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px dashed rgba(255,255,255,0.25)',
                        background: 'rgba(255,255,255,0.03)',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        width: 'fit-content',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      📎 Agregar foto ({fotos.length}/{MAX_FOTOS})
                    </button>
                  </>
                )}
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <Button
                  id="pqrs-submit"
                  label={loadingCrear ? 'Radicando...' : 'Radicar Solicitud'}
                  type="submit"
                  disabled={formularioInvalido}
                />
              </div>
            </form>
          </FormCard>
        </div>
      )}

      {/* ── TAB CONSULTAR ── */}
      {activeTab === 'consultar' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <FormCard title="Consultar Estado de PQRS">
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Ingresa el número de radicado que recibiste en tu correo para conocer el estado actual de tu solicitud.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ flex: 1 }}>
                <InputField
                  id="pqrs-radicado"
                  label="Número de Radicado"
                  type="text"
                  placeholder="Ej: PQRS-2026-001234"
                  value={radicadoBusqueda}
                  onChange={(e) => setRadicadoBusqueda(e.target.value.toUpperCase())}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button
                  id="pqrs-consultar"
                  label={loadingConsultar ? 'Buscando...' : 'Consultar'}
                  onClick={() => consultarPQRS()}
                  disabled={loadingConsultar || !radicadoBusqueda}
                />
              </div>
            </div>

            {pqrs && (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '1.5rem',
                animation: 'fadeIn 0.4s ease',
              }}>
                {/* Radicado + Estado */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Radicado
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{pqrs.radicado}</div>
                  </div>
                  <div style={{
                    background: getEstadoStyle(pqrs.estado).bg,
                    color: getEstadoStyle(pqrs.estado).text,
                    padding: '0.4rem 1rem',
                    borderRadius: '24px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>
                    {pqrs.estado || 'Recibido'}
                  </div>
                </div>

                {/* Detalles */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tipo</div>
                    <div style={{ fontWeight: 600 }}>{pqrs.tipo}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Categoría</div>
                    <div style={{ fontWeight: 600 }}>{pqrs.categoria}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Correo de Contacto</div>
                    <div style={{ fontWeight: 600 }}>{pqrs.emailContacto}</div>
                  </div>
                  {pqrs.tiempoEstimado && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tiempo estimado de respuesta</div>
                      <div style={{ fontWeight: 600 }}>{pqrs.tiempoEstimado}</div>
                    </div>
                  )}
                  {pqrs.creadoEn && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Fecha de creación</div>
                      <div style={{ fontWeight: 600 }}>
                        {new Date(pqrs.creadoEn).toLocaleDateString('es-CO', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Descripción */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Descripción Reportada</div>
                  <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{pqrs.descripcion}</p>
                </div>

                {/* Fotos adjuntas */}
                {pqrs.fotos && pqrs.fotos.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Fotografías adjuntas ({pqrs.fotos.length})
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {pqrs.fotos.map((foto) => (
                        <a
                          key={foto.id}
                          href={pqrsService.obtenerFotoUrl(pqrs.id!, foto.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={foto.nombreOriginal}
                        >
                          <img
                            src={pqrsService.obtenerFotoUrl(pqrs.id!, foto.id)}
                            alt={foto.nombreOriginal}
                            style={{
                              width: '90px',
                              height: '90px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid rgba(255,255,255,0.15)',
                              cursor: 'pointer',
                              transition: 'opacity 0.2s',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.8')}
                            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Respuesta del agente */}
                {pqrs.respuesta && (
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: '1.5rem',
                    background: 'rgba(59,130,246,0.05)',
                    margin: '1.5rem -1.5rem -1.5rem',
                    padding: '1.5rem',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
                  }}>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--accent-color, #3b82f6)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '0.5rem',
                    }}>
                      Respuesta de Atención al Cliente
                    </div>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{pqrs.respuesta}</p>
                  </div>
                )}
              </div>
            )}
          </FormCard>
        </div>
      )}
    </div>
  );
}