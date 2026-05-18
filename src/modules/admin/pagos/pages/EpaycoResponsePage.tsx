import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EpaycoResponsePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [refPayco, setRefPayco] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'approved' | 'pending' | 'rejected' | 'error' | ''>('');
  const [txData, setTxData] = useState<any>(null);

  useEffect(() => {
    const initialRef = searchParams.get('ref_payco');
    if (initialRef) {
      setRefPayco(initialRef);
      setMessage('Ref_payco encontrado en la URL. Puedes validar directamente.');
    }
  }, [searchParams]);

  const verificarPago = async () => {
    if (!refPayco.trim()) {
      setStatus('error');
      setMessage('Debes ingresar un ref_payco.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setStatus('error');
      setMessage('No se encontró token de autenticación. Inicia sesión e intenta de nuevo.');
      return;
    }

    setLoading(true);
    setStatus('');
    setMessage('Validando el pago con el backend...');

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post(
        `${apiUrl}/metodo-pago-ciudadano/verificar-epayco`,
        { ref_payco: refPayco.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('RESPUESTA:', response.data);

      const backendStatus = response.data.status?.toString()?.toLowerCase();
      console.log('STATUS RECIBIDO:', backendStatus);

      setTxData(response.data);

      if (backendStatus === 'approved' || response.data.success === true) {
        setStatus('approved');
        setMessage('Recarga aplicada exitosamente.');
      } else if (backendStatus === 'pending') {
        setStatus('pending');
        setMessage('Pago pendiente de confirmación. Por favor intenta nuevamente en unos minutos.');
      } else if (backendStatus === 'rejected') {
        setStatus('rejected');
        setMessage('Pago rechazado. Verifica el ref_payco e intenta de nuevo.');
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Estado de pago no reconocido.');
      }
    } catch (error: any) {
      console.error('Error verificando pago:', error);
      setStatus('error');
      setMessage(
        error?.response?.data?.message ||
        error?.message ||
        'Error verificando el pago.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', color: '#0f172a' }}>
      <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 25px 50px rgba(15,23,42,0.05)' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Validar Pago ePayco Sandbox</h1>
        <p style={{ color: '#475569', marginTop: '1rem', lineHeight: 1.8 }}>
          1. Completa el pago en ePayco Sandbox.
          <br />
          2. Copia el código <strong>ref_payco</strong> del recibo.
          <br />
          3. Pega el código aquí y presiona "Validar Pago".
        </p>

        <label style={{ display: 'block', marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 700, color: '#0f172a' }}>
          Ref_payco
        </label>
        <input
          type="text"
          placeholder="Pega aquí el ref_payco"
          value={refPayco}
          onChange={(e) => setRefPayco(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '0.75rem',
            border: '1px solid #cbd5e1',
            fontSize: '1rem',
            color: '#0f172a'
          }}
        />

        <button
          onClick={verificarPago}
          disabled={loading}
          style={{
            width: '100%',
            marginTop: '1.25rem',
            background: '#0f172a',
            color: 'white',
            padding: '1rem',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 700
          }}
        >
          {loading ? 'Validando...' : 'Validar Pago'}
        </button>

        {message && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '0.75rem', background: status === 'approved' ? '#d1fae5' : status === 'pending' ? '#fef3c7' : '#fee2e2', color: status === 'approved' ? '#064e3b' : status === 'pending' ? '#92400e' : '#991b1b' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{status ? status.toUpperCase() : 'INFORMACIÓN'}</h2>
            <p style={{ margin: '0.5rem 0 0' }}>{message}</p>
            {status === 'approved' && txData?.monto && (
              <p style={{ margin: '0.75rem 0 0', fontWeight: 700 }}>
                Monto acreditado: ${Number(txData.monto).toLocaleString('es-CO')}
              </p>
            )}
          </div>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/dashboard')}
            type="button"
            style={{ flex: 1, padding: '0.9rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', background: 'white', color: '#0f172a', fontWeight: 700, cursor: 'pointer' }}
          >
            Ir a Billetera
          </button>
          <button
            onClick={() => navigate('/cartera/recarga')}
            type="button"
            style={{ flex: 1, padding: '0.9rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontWeight: 700, cursor: 'pointer' }}
          >
            Volver a recarga
          </button>
        </div>
      </div>
    </div>
  );
};

export default EpaycoResponsePage;
