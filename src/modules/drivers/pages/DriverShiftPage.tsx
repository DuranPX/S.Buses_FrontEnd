import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverShift } from '../hooks/useDriverShift';
import { MockGPSController } from '../components/MockGPSController';
import { Loader } from '../../../shared/components/ui/Loader';

const DriverShiftPage = () => {
  const { shift, isLoading, endShift, isProcessing } = useDriverShift();
  const navigate = useNavigate();

  useEffect(() => {
    // Si no tiene turno en curso, redirigir a iniciar
    if (!isLoading && shift?.estado !== 'En_Curso') {
      navigate('/conductor/turno/iniciar', { replace: true });
    }
  }, [shift, isLoading, navigate]);

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Loader /></div>;
  }

  if (!shift || shift.estado !== 'En_Curso') return null;

  const tInicio = new Date(shift.fecha_inicio_real || shift.fecha_inicio_programada).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f8fafc' }}>
            Turno en Curso
          </h1>
          <p style={{ color: '#34d399', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#34d399', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            Transmitiendo GPS Activamente
          </p>
        </div>
        <button 
          onClick={async () => {
            if (window.confirm('¿Estás seguro de finalizar el turno ahora?')) {
              await endShift();
              navigate('/conductor/turno/iniciar');
            }
          }}
          disabled={isProcessing}
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', cursor: isProcessing ? 'not-allowed' : 'pointer', fontWeight: 600 }}
        >
          {isProcessing ? 'Finalizando...' : 'Finalizar Turno'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Bus Asignado</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>{shift.bus_placa}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Hora Inicio Real</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>{tInicio}</div>
        </div>
      </div>

      <MockGPSController />

      <div style={{ flex: 1, background: '#1e293b', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Placeholder para un mapa interno del conductor si fuera necesario */}
        <div style={{ color: '#64748b', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🗺️</span>
          Vista de navegación en construcción
        </div>
      </div>
    </div>
  );
};

export default DriverShiftPage;
