import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { loadEpaycoScript } from '../../../shared/utils/epayco';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { billeteraPrincipal } = useWallet();
  const { user } = useAuth();
  const amount = location.state?.amount || 0;
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saldoActual = Number(billeteraPrincipal?.saldo || 0);
  const saldoDespues = saldoActual + amount;

  if (!amount) {
    navigate('/cartera/recarga', { replace: true });
    return null;
  }

  const handlePay = async () => {
    const billeteraId = billeteraPrincipal?.id || 'billetera-uuid-1234';
    setIsProcessing(true);
    setError(null);

    try {
      const ePayco = await loadEpaycoScript();
      const handler = ePayco.checkout.configure({
        key: import.meta.env.VITE_EPAYCO_PUBLIC_KEY,
        test: import.meta.env.VITE_EPAYCO_TEST === 'true'
      });

      const numFactura = `REC-${billeteraId}-${crypto.randomUUID()}`;
      const appUrl = import.meta.env.VITE_APP_URL;

      const data = {
        name: "Recarga Billetera de Transporte",
        description: `Recarga tarjeta transporte #${billeteraId}`,
        invoice: numFactura,
        currency: "cop",
        amount: amount.toString(),
        tax_base: "0",
        tax: "0",
        country: "co",
        lang: "es",
        extra1: billeteraId,
        extra2: "RECARGA",
        external: false,
        response: `${appUrl}/admin/pagos/respuesta`,
        test: import.meta.env.VITE_EPAYCO_TEST === 'true',
        email_billing: user?.email || ""
      };

      console.log("RESPONSE URL:", data.response);
      handler.open(data);
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Error al inicializar la pasarela de ePayco.');
      setIsProcessing(false);
    }
  };

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
          <p style={{ color: '#64748b', margin: 0 }}>Integración oficial con ePayco Checkout</p>
        </div>

        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: '#64748b' }}>Saldo actual</span>
            <span style={{ fontWeight: 600 }}>${saldoActual.toLocaleString('es-CO')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: '#64748b' }}>Saldo después de recarga</span>
            <span style={{ fontWeight: 600 }}>${saldoDespues.toLocaleString('es-CO')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', marginTop: '1rem' }}>
            <span>Total a Pagar</span>
            <span>${amount.toLocaleString('es-CO')}</span>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #f87171', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <button 
          onClick={handlePay} disabled={isProcessing}
          style={{ width: '100%', background: '#000', color: 'white', padding: '1.2rem', borderRadius: '0.5rem', border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1.1rem', opacity: isProcessing ? 0.8 : 1 }}
        >
          {isProcessing ? 'Abriendo ePayco...' : 'Continuar al pago'}
        </button>

        <button
          onClick={() => navigate('/admin/pagos/respuesta')}
          type="button"
          style={{ width: '100%', marginTop: '0.75rem', background: '#64748b', color: 'white', padding: '1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}
        >
          Ya pagué / Validar pago manualmente
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>
          Serás redirigido al widget seguro de ePayco para completar tu pago.
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;
