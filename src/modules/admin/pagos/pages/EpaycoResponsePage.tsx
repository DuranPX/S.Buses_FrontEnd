import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const EpaycoResponsePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [txData, setTxData] = useState<any>(null);
  const refPayco = searchParams.get('ref_payco');

  useEffect(() => {
    if (!refPayco) {
      setStatus('error');
      return;
    }
    // Llamar al backend para que verifique la transacción contra la API de ePayco
    const verificarPago = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await axios.post(`${apiUrl}/metodo-pago-ciudadano/verificar-epayco`, {
          ref_payco: refPayco
        });
        setTxData(res.data);
        setStatus(res.data.success ? 'success' : 'error');
      } catch (err) {
        setStatus('error');
      }
    };
    verificarPago();
  }, [refPayco]);

  if (status === 'loading') {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'white', fontSize: '1.2rem' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.2)', borderTopColor: '#34d399', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
        Validando transacción con ePayco...
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '600px', margin: '2rem auto', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
      {status === 'success' ? (
        <>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>✅</span>
          <h1 style={{ color: '#34d399', margin: '0 0 1rem', fontSize: '2rem', fontWeight: 800 }}>¡Pago Aprobado Exitosamente!</h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Tu recarga por <strong style={{ color: '#fff' }}>${Number(txData?.monto || 0).toLocaleString('es-CO')}</strong> ha sido acreditada en tu Billetera Virtual.
          </p>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ background: '#6366f1', color: 'white', padding: '0.8rem 2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
          >
            Ir a Billetera
          </button>
        </>
      ) : (
        <>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>❌</span>
          <h1 style={{ color: '#ef4444', margin: '0 0 1rem', fontSize: '2rem', fontWeight: 800 }}>La transacción no fue aprobada</h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Por favor verifica tus fondos o intenta con otro método de pago.
          </p>
          <button 
            onClick={() => navigate(-1)} 
            style={{ background: '#64748b', color: 'white', padding: '0.8rem 2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
          >
            Volver a intentar
          </button>
        </>
      )}
    </div>
  );
};

export default EpaycoResponsePage;
