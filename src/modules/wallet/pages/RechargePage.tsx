import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RechargePage = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>(10000);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecharge = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/cartera/pago', { state: { amount } });
    }, 800);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
          Recargar Cartera
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Añade saldo a tu cuenta para comprar boletos más rápido.
        </p>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '1rem' }}>Saldo Actual</div>
        <div style={{ fontSize: '3rem', fontWeight: 700, color: '#34d399', marginBottom: '2rem' }}>$14.500</div>

        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Monto a recargar ($)</label>
          <input 
            type="number" value={amount} onChange={e => setAmount(Number(e.target.value))}
            style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1.5rem', textAlign: 'center', fontWeight: 'bold' }} 
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {[5000, 10000, 20000, 50000].map(val => (
            <button key={val} onClick={() => setAmount(val)} style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.25rem', cursor: 'pointer' }}>
              +${val / 1000}k
            </button>
          ))}
        </div>

        <button 
          onClick={handleRecharge} disabled={isProcessing || amount < 1000}
          style={{ width: '100%', background: '#6366f1', color: 'white', padding: '1.2rem', borderRadius: '0.5rem', border: 'none', cursor: (isProcessing || amount < 1000) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1.2rem', opacity: (isProcessing || amount < 1000) ? 0.7 : 1 }}
        >
          {isProcessing ? 'Procesando...' : `Continuar a Pago ($${amount.toLocaleString('es-CO')})`}
        </button>
      </div>
    </div>
  );
};

export default RechargePage;
