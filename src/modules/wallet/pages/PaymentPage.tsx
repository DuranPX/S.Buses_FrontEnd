import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const amount = location.state?.amount || 0;
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!amount) {
    navigate('/cartera/recarga', { replace: true });
    return null;
  }

  const handlePay = () => {
    setIsProcessing(true);
    // Simular el tiempo de respuesta de ePayco
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <div style={{ padding: '2rem', maxWidth: '500px', margin: '2rem auto', textAlign: 'center', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '1rem' }}>
        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🎉</span>
        <h2 style={{ color: '#10b981', margin: '0 0 1rem' }}>¡Recarga Exitosa!</h2>
        <p style={{ color: '#e2e8f0', marginBottom: '2rem' }}>
          Tu saldo ha sido actualizado con <strong>${amount.toLocaleString('es-CO')}</strong>.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ background: '#10b981', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', height: '100%' }}>
      <button 
        onClick={() => navigate(-1)}
        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        ← Volver
      </button>

      <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', color: '#0f172a' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 0.5rem' }}>Pasarela de Pagos Segura</h2>
          <p style={{ color: '#64748b', margin: 0 }}>Mock de integración con ePayco</p>
        </div>

        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#64748b' }}>Concepto</span>
            <span style={{ fontWeight: 600 }}>Recarga de Cartera Virtual</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', marginTop: '1rem' }}>
            <span>Total a Pagar</span>
            <span>${amount.toLocaleString('es-CO')}</span>
          </div>
        </div>

        <button 
          onClick={handlePay} disabled={isProcessing}
          style={{ width: '100%', background: '#000', color: 'white', padding: '1.2rem', borderRadius: '0.5rem', border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1.1rem', opacity: isProcessing ? 0.8 : 1 }}
        >
          {isProcessing ? 'Procesando Tarjeta...' : 'Pagar con ePayco'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>
          Transacción 100% simulada. No ingrese datos reales.
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;
