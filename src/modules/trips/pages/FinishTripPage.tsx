import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../../tickets/hooks/useTickets';
import { useNearbyStops } from '../../stops/hooks/useNearbyStops';
import { useGeolocation } from '../../stops/hooks/useGeolocation';
import { useTripFinish } from '../hooks/useTripFinish';
import { Loader } from '../../../shared/components/ui/Loader';

const FinishTripPage = () => {
  const navigate = useNavigate();
  const { tickets, isLoading: loadingTickets } = useTickets();
  const { location } = useGeolocation();
  const { stops } = useNearbyStops(location);
  const { finishTrip, isLoading: finishing, error } = useTripFinish();

  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [selectedStopId, setSelectedStopId] = useState<string>('');

  useEffect(() => {
    if (tickets.length > 0 && !selectedTicketId) setSelectedTicketId(tickets[0].id);
  }, [tickets, selectedTicketId]);

  useEffect(() => {
    if (stops.length > 0 && !selectedStopId) setSelectedStopId(stops[0].id);
  }, [stops, selectedStopId]);

  const handleFinish = async () => {
    if (!selectedTicketId || !selectedStopId) return;
    const trip = await finishTrip(selectedTicketId, selectedStopId);
    if (trip) {
      navigate('/viaje/completado', { state: { trip } });
    }
  };

  if (loadingTickets) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Loader /></div>;
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
          Finalizar Viaje
        </h1>
        <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
          Marca tu descenso seleccionando tu boleto activo y el paradero en el que te encuentras.
        </p>
      </div>

      {tickets.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <p>No tienes boletos activos para finalizar.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#e2e8f0' }}>1. Selecciona tu boleto activo</label>
            <select 
              value={selectedTicketId}
              onChange={e => setSelectedTicketId(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }}
            >
              <option value="" disabled>-- Selecciona un boleto --</option>
              {tickets.map(t => (
                <option key={t.id} value={t.id}>{t.ruta_codigo} - {t.origen_nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#e2e8f0' }}>2. ¿En qué paradero te bajas?</label>
            <select 
              value={selectedStopId}
              onChange={e => setSelectedStopId(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }}
            >
              <option value="" disabled>-- Selecciona un paradero --</option>
              {stops.length > 0 
                ? stops.map(s => <option key={s.id} value={s.id}>{s.nombre} ({s.distancia} km)</option>)
                : <option value="manual-1">Terminal de Transportes (Manual)</option> // Fallback si no hay geolocalización
              }
            </select>
            {stops.length > 0 && <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#34d399' }}>Mostrando paraderos ordenados por cercanía a tu ubicación actual.</p>}
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</div>}

          <button 
            onClick={handleFinish}
            disabled={!selectedTicketId || !selectedStopId || finishing}
            style={{ 
              background: '#10b981', color: 'white', padding: '1rem', borderRadius: '0.5rem', 
              border: 'none', cursor: (!selectedTicketId || !selectedStopId || finishing) ? 'not-allowed' : 'pointer', 
              fontWeight: 700, fontSize: '1.1rem', marginTop: '1rem',
              opacity: (!selectedTicketId || !selectedStopId || finishing) ? 0.5 : 1
            }}
          >
            {finishing ? 'Procesando...' : 'Finalizar Viaje'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FinishTripPage;
