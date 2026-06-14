import { useState } from 'react';
import { pqrsService } from '../services/pqrs.service';
import type { CrearPQRSRequest, PQRS } from '../types/pqrs.types';
import { FormCard } from '../../../shared/components/cards/FormCard';
import InputField from '../../../shared/components/forms/InputField';
import { Button } from '../../../shared/components/ui/Button';
import { showAlert } from '../../../shared/utils/alerts';

export default function PQRSPage() {
  const [activeTab, setActiveTab] = useState<'crear' | 'consultar'>('crear');

  const [form, setForm] = useState<CrearPQRSRequest>({
    tipo: 'Petición',
    categoria: 'Otro',
    descripcion: '',
    emailContacto: '',
  });

  const [radicadoBusqueda, setRadicadoBusqueda] = useState('');
  const [pqrs, setPqrs] = useState<PQRS | null>(null);
  const [loadingCrear, setLoadingCrear] = useState(false);
  const [loadingConsultar, setLoadingConsultar] = useState(false);

  const crearPQRS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descripcion.trim()) {
      showAlert.error("Error", "La descripción es obligatoria");
      return;
    }
    if (!form.emailContacto.trim()) {
      showAlert.error("Error", "El email de contacto es obligatorio");
      return;
    }

    try {
      setLoadingCrear(true);
      const response = await pqrsService.crear(form);
      showAlert.success(
        "¡Solicitud Recibida!",
        response.radicado 
          ? `Tu número de radicado es: ${response.radicado}. Guárdalo para futuras consultas.` 
          : "Tu solicitud ha sido radicada con éxito."
      );
      setForm({ tipo: 'Petición', categoria: 'Otro', descripcion: '', emailContacto: '' });
      if (response.radicado) {
        setRadicadoBusqueda(response.radicado);
        setActiveTab('consultar');
        consultarPQRS(response.radicado);
      }
    } catch (error) {
      console.error(error);
      showAlert.error("Error", "No se pudo crear la PQRS. Intenta más tarde.");
    } finally {
      setLoadingCrear(false);
    }
  };

  const consultarPQRS = async (radicadoToSearch = radicadoBusqueda) => {
    if (!radicadoToSearch.trim()) {
      showAlert.warning("Atención", "Ingresa un número de radicado válido");
      return;
    }
    try {
      setLoadingConsultar(true);
      const response = await pqrsService.consultar(radicadoToSearch);
      setPqrs(response);
    } catch (error: any) {
      console.error(error);
      showAlert.error("No encontrada", error.response?.data?.error || "No se encontró ninguna PQRS con ese radicado.");
      setPqrs(null);
    } finally {
      setLoadingConsultar(false);
    }
  };

  return (
    <div className="pqrs-page" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Atención al Ciudadano</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Envía tus peticiones, quejas, reclamos o sugerencias (PQRS) o consulta el estado de un radicado existente.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={() => setActiveTab('crear')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem 1.5rem',
            color: activeTab === 'crear' ? 'var(--accent-color, #3b82f6)' : 'var(--text-muted)',
            fontWeight: activeTab === 'crear' ? 600 : 400,
            borderBottom: activeTab === 'crear' ? '2px solid var(--accent-color, #3b82f6)' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Radicar nueva PQRS
        </button>
        <button
          onClick={() => setActiveTab('consultar')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem 1.5rem',
            color: activeTab === 'consultar' ? 'var(--accent-color, #3b82f6)' : 'var(--text-muted)',
            fontWeight: activeTab === 'consultar' ? 600 : 400,
            borderBottom: activeTab === 'consultar' ? '2px solid var(--accent-color, #3b82f6)' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Consultar estado
        </button>
      </div>

      {activeTab === 'crear' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <FormCard title="Crear nueva PQRS">
            <form onSubmit={crearPQRS} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Tipo de Solicitud
                  </label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    style={{
                      padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.05)', color: 'inherit', fontSize: '0.9rem', appearance: 'none'
                    }}
                  >
                    <option value="Petición">Petición</option>
                    <option value="Queja">Queja</option>
                    <option value="Reclamo">Reclamo</option>
                    <option value="Sugerencia">Sugerencia</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Categoría
                  </label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    style={{
                      padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.12)',
                      background: 'rgba(0, 0, 0, 0.05)', color: 'inherit', fontSize: '0.9rem', appearance: 'none'
                    }}
                  >
                    <option value="Conductor">Conductor</option>
                    <option value="Bus">Bus</option>
                    <option value="Ruta">Ruta</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <InputField 
                label="Correo de Contacto" 
                type="email" 
                placeholder="Donde recibirás la confirmación" 
                value={form.emailContacto}
                onChange={(e) => setForm({ ...form, emailContacto: e.target.value })}
                required
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Descripción
                </label>
                <textarea
                  className="border rounded p-2"
                  rows={4}
                  maxLength={500}
                  placeholder="Detalla tu situación aquí (máx. 500 caracteres)..."
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  style={{
                    padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.05)', color: 'inherit', fontSize: '0.9rem', resize: 'vertical'
                  }}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  {form.descripcion.length} / 500
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <Button 
                  label={loadingCrear ? "Radicando..." : "Radicar Solicitud"} 
                  type="submit" 
                  disabled={loadingCrear || !form.descripcion || !form.emailContacto} 
                />
              </div>
            </form>
          </FormCard>
        </div>
      )}

      {activeTab === 'consultar' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <FormCard title="Consultar Estado de PQRS">
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Ingresa el número de radicado que recibiste en tu correo para conocer el estado actual de tu solicitud.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ flex: 1 }}>
                <InputField 
                  label="Número de Radicado" 
                  type="text" 
                  placeholder="Ej: PQRS-2026-001234" 
                  value={radicadoBusqueda}
                  onChange={(e) => setRadicadoBusqueda(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button 
                  label={loadingConsultar ? "Buscando..." : "Consultar"} 
                  onClick={() => consultarPQRS()} 
                  disabled={loadingConsultar || !radicadoBusqueda} 
                />
              </div>
            </div>

            {pqrs && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', animation: 'fadeIn 0.4s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Radicado</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{pqrs.radicado}</div>
                  </div>
                  <div style={{ 
                    background: pqrs.estado?.toLowerCase() === 'resuelto' ? 'rgba(34,197,94,0.1)' : 
                               pqrs.estado?.toLowerCase() === 'en proceso' ? 'rgba(59,130,246,0.1)' : 
                               'rgba(234,179,8,0.1)',
                    color: pqrs.estado?.toLowerCase() === 'resuelto' ? '#22c55e' : 
                           pqrs.estado?.toLowerCase() === 'en proceso' ? '#3b82f6' : 
                           '#eab308',
                    padding: '0.4rem 1rem', borderRadius: '24px', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase'
                  }}>
                    {pqrs.estado || "Recibido"}
                  </div>
                </div>

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
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginBottom: pqrs.respuesta ? '1.5rem' : '0' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Descripción Reportada</div>
                  <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{pqrs.descripcion}</p>
                </div>

                {pqrs.respuesta && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', background: 'rgba(59,130,246,0.05)', margin: '0 -1.5rem -1.5rem', padding: '1.5rem', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-color, #3b82f6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Respuesta de Atención al Cliente</div>
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