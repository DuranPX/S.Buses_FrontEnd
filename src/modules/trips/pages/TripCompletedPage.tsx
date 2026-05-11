import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Trip } from '../types/trip.types';

const TripCompletedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const trip = location.state?.trip as Trip | undefined;

  useEffect(() => {
    if (!trip) navigate('/viajes/historial', { replace: true });
  }, [trip, navigate]);

  if (!trip) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 120px)', padding: '1rem', textAlign: 'center' }}>
      <div style={{
        background: 'rgba(56,189,248,0.1)',
        border: '1px solid rgba(56,189,248,0.2)',
        borderRadius: '1rem',
        padding: '3rem 2rem',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ 
          width: '80px', height: '80px', background: '#38bdf8', color: 'white',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem', margin: '0 auto 1.5rem',
          boxShadow: '0 0 20px rgba(56,189,248,0.4)'
        }}>
          🏁
        </div>
        
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 1rem', color: '#f8fafc' }}>
          ¡Viaje Completado!
        </h1>
        
        <p style={{ color: '#94a3b8', margin: '0 0 2rem', lineHeight: 1.5 }}>
          Has registrado tu descenso exitosamente. El viaje duró {trip.duracion_minutos} minutos.
          ¡Gracias por viajar con nosotros!
        </p>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', textAlign: 'left', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#94a3b8' }}>Ruta:</span>
            <span style={{ fontWeight: 600 }}>{trip.ruta_codigo}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#94a3b8' }}>Origen:</span>
            <span>{trip.origen_nombre}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Destino:</span>
            <span style={{ fontWeight: 600, color: '#38bdf8' }}>{trip.destino_nombre}</span>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/viajes/${trip.id}`)}
          style={{ background: '#38bdf8', color: '#0f172a', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 700, width: '100%' }}
        >
          Ver Detalle del Viaje
        </button>
      </div>
    </div>
  );
};

export default TripCompletedPage;
