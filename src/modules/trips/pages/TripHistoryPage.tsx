import { useTripHistory } from '../hooks/useTripHistory';
import { TripCard } from '../components/TripCard';
import { Loader } from '../../../shared/components/ui/Loader';
import { useNavigate } from 'react-router-dom';

const TripHistoryPage = () => {
  const { trips, isLoading, error } = useTripHistory();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            Historial de Viajes
          </h1>
          <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
            Tus trayectos completados en el sistema de transporte.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
          <Loader />
        </div>
      ) : error ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
          {error}
        </div>
      ) : trips.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🚌</span>
          <h3 style={{ margin: '0 0 0.5rem', color: '#f8fafc' }}>Aún no tienes viajes completados</h3>
          <p style={{ margin: '0 0 1.5rem' }}>Compra un boleto y súbete a uno de nuestros buses.</p>
          <button 
            onClick={() => navigate('/rutas')}
            style={{ background: '#6366f1', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Explorar Rutas
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TripHistoryPage;
