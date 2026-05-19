import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverShift } from '../hooks/useDriverShift';
import { BusConditionCheck } from '../components/BusConditionCheck';
import { Loader } from '../../../shared/components/ui/Loader';
import type { BusCondition } from '../types/driver.types';

const StartShiftPage = () => {
  const { shift, isLoading, error, isProcessing, startShift } = useDriverShift();
  const navigate = useNavigate();

  useEffect(() => {
    // Si ya tiene un turno en curso, redirigir al dashboard de turno
    if (shift?.estado === 'EN_CURSO') {
      navigate('/conductor/turno', { replace: true });
    }
  }, [shift, navigate]);

  const handleStart = async (condition: BusCondition) => {
    if (!shift) return;
    const success = await startShift(shift.id, condition);
    if (success) {
      navigate('/conductor/turno');
    }
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Loader /></div>;
  }

  if (error || !shift) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ color: '#f8fafc' }}>No hay turnos programados</h2>
        <p style={{ color: '#94a3b8' }}>{error || 'Actualmente no tienes ningún turno asignado para iniciar.'}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
          Iniciar Turno
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Antes de iniciar tu recorrido, verifica el estado del vehículo asignado.
        </p>
      </div>

      <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#a5b4fc', fontSize: '1.1rem' }}>Detalles de Asignación</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8' }}>Bus Asignado</span>
            <strong style={{ fontSize: '1.1rem', color: '#f8fafc' }}>{shift.bus_placa || shift.bus_id}</strong>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8' }}>Hora Programada</span>
            <strong style={{ fontSize: '1.1rem', color: '#f8fafc' }}>
              {new Date(shift.fecha_inicio_programada).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            </strong>
          </div>
        </div>
      </div>

      <BusConditionCheck onSubmit={handleStart} isProcessing={isProcessing} />
      
      {error && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '0.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default StartShiftPage;
