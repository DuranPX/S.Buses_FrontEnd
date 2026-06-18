import { useState } from 'react';
import { asesoresService } from '../services/asesores.service';
import { FormCard } from '../../../shared/components/cards/FormCard';
import { Button } from '../../../shared/components/ui/Button';
import { showAlert } from '../../../shared/utils/alerts';
import { useAuth } from '../../../features/auth/hooks/useAuth';

export default function AsesoriasPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [asesores, setAsesores] = useState<any[]>([]);

  const [tipoAtencion, setTipoAtencion] = useState('Virtual');
  const [tipoConsulta, setTipoConsulta] = useState('Problema con tarjeta');
  const [motivo, setMotivo] = useState('');

  const [selectedAsesor, setSelectedAsesor] = useState<any>(null);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  const consultar = async () => {
    try {
      setLoading(true);
      const response = await asesoresService.consultarDisponibilidad({
        tipoAtencion,
        tipoConsulta,
      });
      let data = response.asesores || response.data || response;
      if (Array.isArray(data) && data.length > 0 && data[0].json?.asesores) {
        data = data[0].json.asesores;
      }
      setAsesores(Array.isArray(data) ? data : []);
      setStep(2);
    } catch (error) {
      console.error(error);
      showAlert.error("Error", "No se pudo consultar la disponibilidad. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const confirmar = async () => {
    if (!selectedAsesor) return;
    if (!fecha || !hora) {
      showAlert.warning("Atención", "Debes seleccionar una fecha y una hora.");
      return;
    }
    if (!motivo.trim()) {
      showAlert.warning("Atención", "Escribe un motivo para tu consulta");
      return;
    }

    try {
      setLoading(true);
      
      // Construir fechaInicio y fechaFin (asumiendo 30 mins de duración)
      const startDateTime = new Date(`${fecha}T${hora}`);
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

      await asesoresService.confirmarCita({
        nombre: user?.name + " " + (user?.lastName || ""),
        email: user?.email || "",
        tipoAtencion,
        tipoConsulta,
        asesorId: selectedAsesor.id || selectedAsesor.asesorId,
        calendarId: selectedAsesor.calendarId,
        fechaInicio: startDateTime.toISOString(),
        fechaFin: endDateTime.toISOString(),
        motivo
      });
      
      showAlert.success("Cita Confirmada", "Te hemos enviado un correo con los detalles de tu cita.");
      // Reiniciar
      setStep(1);
      setSelectedAsesor(null);
      setFecha('');
      setHora('');
      setMotivo('');
    } catch (error) {
      console.error(error);
      showAlert.error("Error", "No se pudo confirmar la cita. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="asesorias-page" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Agendar Asesoría</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Programa una cita con nuestros asesores para recibir atención personalizada.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', alignItems: 'center' }}>
        <div style={{ flex: 1, height: '4px', background: step >= 1 ? 'var(--accent-color, #3b82f6)' : 'rgba(255,255,255,0.1)', borderRadius: '4px', transition: '0.3s' }} />
        <div style={{ flex: 1, height: '4px', background: step >= 2 ? 'var(--accent-color, #3b82f6)' : 'rgba(255,255,255,0.1)', borderRadius: '4px', transition: '0.3s' }} />
        <div style={{ flex: 1, height: '4px', background: step >= 3 ? 'var(--accent-color, #3b82f6)' : 'rgba(255,255,255,0.1)', borderRadius: '4px', transition: '0.3s' }} />
      </div>

      {step === 1 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <FormCard title="1. ¿Qué necesitas?">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Tipo de Atención</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {['Virtual', 'Presencial'].map(tipo => (
                    <div 
                      key={tipo}
                      onClick={() => setTipoAtencion(tipo)}
                      style={{
                        padding: '1rem', textAlign: 'center', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                        border: tipoAtencion === tipo ? '2px solid var(--accent-color, #3b82f6)' : '1px solid rgba(255,255,255,0.1)',
                        background: tipoAtencion === tipo ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.2s', fontWeight: tipoAtencion === tipo ? 600 : 400
                      }}
                    >
                      {tipo === 'Virtual' ? '💻 Videollamada' : '🏢 En Oficina'}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Motivo Principal</label>
                <select
                  value={tipoConsulta}
                  onChange={(e) => setTipoConsulta(e.target.value)}
                  style={{
                    padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(0, 0, 0, 0.05)', color: 'inherit', fontSize: '1rem', appearance: 'none'
                  }}
                >
                  <option value="Problema con tarjeta">Problema con tarjeta</option>
                  <option value="Reclamo">Reclamo</option>
                  <option value="Reembolso">Reembolso</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Button label={loading ? "Buscando Asesores..." : "Siguiente"} onClick={consultar} disabled={loading} />
              </div>
            </div>
          </FormCard>
        </div>
      )}

      {step === 2 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <FormCard title="2. Selecciona un Asesor">
            {asesores.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                <p>No hay asesores disponibles en este momento.</p>
                <Button label="Volver" onClick={() => setStep(1)} style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.1)' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                  {asesores.map((asesor, idx) => {
                    const isSelected = selectedAsesor?.id === asesor.id || selectedAsesor?.asesorId === asesor.asesorId;
                    return (
                      <div
                        key={asesor.id || asesor.asesorId || idx}
                        onClick={() => setSelectedAsesor(asesor)}
                        style={{
                          padding: '1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                          border: isSelected ? '2px solid var(--accent-color, #3b82f6)' : '1px solid rgba(255,255,255,0.1)',
                          background: isSelected ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>
                          {asesor.nombre || asesor.asesorNombre}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                          {asesor.calendarId}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    Volver
                  </button>
                  <Button 
                    label="Siguiente" 
                    onClick={() => setStep(3)} 
                    disabled={!selectedAsesor} 
                  />
                </div>
              </div>
            )}
          </FormCard>
        </div>
      )}

      {step === 3 && selectedAsesor && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <FormCard title="3. Detalles de la Cita">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Asesor Seleccionado</span>
                  <div style={{ fontWeight: 600 }}>{selectedAsesor.nombre || selectedAsesor.asesorNombre}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Fecha</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    style={{
                      padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.12)',
                      background: 'rgba(0, 0, 0, 0.05)', color: 'inherit', fontSize: '1rem'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Hora</label>
                  <input
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    style={{
                      padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.12)',
                      background: 'rgba(0, 0, 0, 0.05)', color: 'inherit', fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Motivo detallado de la consulta
                </label>
                <textarea
                  rows={3}
                  maxLength={300}
                  placeholder="Ej: Tengo un cobro doble en mi tarjeta..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  style={{
                    padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(0, 0, 0, 0.05)', color: 'inherit', fontSize: '0.9rem', resize: 'vertical'
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  {motivo.length} / 300
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  Volver
                </button>
                <Button 
                  label={loading ? "Confirmando..." : "Confirmar Cita"} 
                  onClick={confirmar} 
                  disabled={loading || !motivo || !fecha || !hora} 
                />
              </div>
            </div>
          </FormCard>
        </div>
      )}
    </div>
  );
}