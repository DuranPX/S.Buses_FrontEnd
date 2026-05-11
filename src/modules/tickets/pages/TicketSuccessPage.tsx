import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TicketSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirigir a inicio si entran directamente sin el state de éxito
    if (!location.state?.success) {
      navigate('/rutas', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 120px)', padding: '1rem', textAlign: 'center' }}>
      <div style={{
        background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '1rem',
        padding: '3rem 2rem',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ 
          width: '80px', height: '80px', background: '#10b981', color: 'white',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem', margin: '0 auto 1.5rem',
          boxShadow: '0 0 20px rgba(16,185,129,0.4)'
        }}>
          ✓
        </div>
        
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 1rem', color: '#f8fafc' }}>
          ¡Boleto Comprado!
        </h1>
        
        <p style={{ color: '#94a3b8', margin: '0 0 2rem', lineHeight: 1.5 }}>
          Tu compra ha sido procesada exitosamente. Ya puedes usar tu boleto para abordar el bus en tu paradero de origen.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/boletos')}
            style={{ background: '#6366f1', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600, flex: 1 }}
          >
            Ver mis Boletos
          </button>
          <button 
            onClick={() => navigate('/paradero/actual')}
            style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, flex: 1 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            Ver Paraderos
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketSuccessPage;
