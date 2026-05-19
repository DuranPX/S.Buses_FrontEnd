import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverShift } from '../hooks/useDriverShift';
import { BusConditionCheck } from '../components/BusConditionCheck';
import { MockGPSController } from '../components/MockGPSController';
import { Loader } from '../../../shared/components/ui/Loader';
import type { BusCondition, DriverShift } from '../types/driver.types';

const estadoBadge = (estado: string) => {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    PROGRAMADO: { label: 'Programado', color: '#a5b4fc', bg: 'rgba(99,102,241,0.15)' },
    EN_CURSO:   { label: 'En Curso',   color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
    FINALIZADO: { label: 'Finalizado', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  };
  return map[estado] || map.PROGRAMADO;
};

const TurnoActualPage = () => {
  const navigate = useNavigate();
  const { shifts, shift, isLoading, error, isProcessing, startShift, endShift, canStartShift } = useDriverShift();
  const [turnoIniciando, setTurnoIniciando] = useState<DriverShift | null>(null);

  const handleStartClick = (turno: DriverShift) => {
    setTurnoIniciando(turno);
  };

  const handleConfirmStart = async (condition: BusCondition) => {
    if (!turnoIniciando) return;
    const success = await startShift(turnoIniciando.id, condition);
    if (success) {
      setTurnoIniciando(null);
    }
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Loader /></div>;
  }

  // ── Vista cuando hay turno EN_CURSO ──
  if (shift) {
    const tInicio = new Date(shift.fecha_inicio_real || shift.fecha_inicio_programada)
      .toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const tFin = new Date(shift.fecha_fin_programada)
      .toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    return (
      <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f8fafc' }}>
              Turno en Curso
            </h1>
            <p style={{ color: '#34d399', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#34d399', borderRadius: '50%' }} />
              GPS Activo
            </p>
          </div>
          <button
            onClick={async () => {
              if (window.confirm('¿Estás seguro de finalizar el turno ahora?')) {
                await endShift();
              }
            }}
            disabled={isProcessing}
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', cursor: isProcessing ? 'not-allowed' : 'pointer', fontWeight: 600 }}
          >
            {isProcessing ? 'Finalizando...' : 'Finalizar Turno'}
          </button>
        </div>

        {/* Info del turno */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Bus Asignado', value: shift.bus_placa || '—' },
            { label: 'Hora Inicio', value: tInicio },
            { label: 'Fin Programado', value: tFin },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{label}</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Reportar incidente */}
        <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: '0 0 0.25rem', color: '#fbbf24', fontWeight: 700 }}>¿Ocurrió un incidente?</h3>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
              Reporta mecánicos, accidentes, retrasos u otros eventos.
            </p>
          </div>
          <button
            onClick={() => navigate('/incidentes/crear', { state: { busId: shift.bus_id, turnoId: shift.id } })}
            style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            🚨 Reportar Incidente
          </button>
        </div>

        <MockGPSController />
      </div>
    );
  }

  // ── Vista de turnos programados ──
  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f8fafc' }}>
          Mis Turnos de Hoy
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Turnos programados para el día de hoy. Puedes iniciar un turno cuando llegue su hora.
        </p>
      </div>

      {error && shifts.length === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📋</span>
          <h3 style={{ color: '#f8fafc', margin: '0 0 0.5rem' }}>Sin turnos para hoy</h3>
          <p style={{ color: '#94a3b8', margin: 0 }}>No tienes turnos asignados para el día de hoy.</p>
        </div>
      )}

      {/* Modal de checklist del bus */}
      {turnoIniciando && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#1e293b', borderRadius: '1rem', padding: '2rem', maxWidth: '600px', width: '100%', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#f8fafc' }}>Verificación del Bus</h2>
              <button onClick={() => setTurnoIniciando(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
            </div>
            <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, color: '#a5b4fc', fontSize: '0.9rem' }}>
                <strong>Bus:</strong> {turnoIniciando.bus_placa} · 
                <strong> Hora:</strong> {new Date(turnoIniciando.fecha_inicio_programada).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <BusConditionCheck onSubmit={handleConfirmStart} isProcessing={isProcessing} />
            {error && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de turnos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {shifts.map(turno => {
          const badge = estadoBadge(turno.estado);
          const puedeIniciar = canStartShift(turno);
          const tInicio = new Date(turno.fecha_inicio_programada).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
          const tFin = new Date(turno.fecha_fin_programada).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
          const minutos = Math.round((new Date(turno.fecha_fin_programada).getTime() - new Date(turno.fecha_inicio_programada).getTime()) / 60000);

          return (
            <div key={turno.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${puedeIniciar ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '1rem', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', flex: 1 }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Bus</span>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1.1rem' }}>{turno.bus_placa || '—'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Horario</span>
                  <div style={{ fontWeight: 600, color: '#cbd5e1' }}>{tInicio} — {tFin}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{minutos} minutos</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Estado</span>
                  <div>
                    <span style={{ display: 'inline-block', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, background: badge.bg, color: badge.color, marginTop: '0.25rem' }}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {turno.estado === 'PROGRAMADO' && (
                  puedeIniciar ? (
                    <button
                      onClick={() => handleStartClick(turno)}
                      disabled={isProcessing}
                      style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
                    >
                      ▶ Iniciar Turno
                    </button>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Disponible a las</div>
                      <div style={{ color: '#94a3b8', fontWeight: 600 }}>{tInicio}</div>
                    </div>
                  )
                )}
                {turno.estado === 'FINALIZADO' && (
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Completado ✓</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TurnoActualPage;