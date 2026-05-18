import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { walletService, type MetodoPagoCatalogo } from '../services/walletService';

const RechargePage = () => {
  const navigate = useNavigate();
  const { billeteras, billeteraPrincipal, saldoActual, isLoadingWallet, recargar, vincularMetodo } = useWallet();
  const [amount, setAmount] = useState<number>(20000);
  const [catalogo, setCatalogo] = useState<MetodoPagoCatalogo[]>([]);
  const [isLoadingCatalogo, setIsLoadingCatalogo] = useState(true);
  const [isProcessingDirect, setIsProcessingDirect] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    walletService.getCatalogoMetodosPago()
      .then(data => setCatalogo(data))
      .catch(err => console.warn("Error al cargar catálogo de métodos de pago:", err))
      .finally(() => setIsLoadingCatalogo(false));
  }, []);

  const handleDirectRecharge = async () => {
    if (!billeteraPrincipal) {
      setErrorMsg("No tienes una billetera activa seleccionada.");
      return;
    }
    setIsProcessingDirect(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await recargar(amount);
      setSuccessMsg(`¡Recarga directa de $${amount.toLocaleString('es-CO')} realizada con éxito!`);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || "Error al procesar la recarga directa.");
    } finally {
      setIsProcessingDirect(false);
    }
  };

  const handleLinkMethod = async (metodoPagoId: string) => {
    setIsLinking(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await vincularMetodo(metodoPagoId);
      setSuccessMsg("¡Método de pago vinculado exitosamente a tu cuenta!");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || "Error al vincular el método de pago.");
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto', color: '#f8fafc' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(to right, #34d399, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Mi Cartera Virtual & Métodos de Pago
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0 }}>
          Consulta tu saldo, gestiona tus métodos de pago y realiza recargas seguras.
        </p>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #34d399', color: '#34d399', padding: '1rem 1.5rem', borderRadius: '0.75rem', marginBottom: '2rem', textAlign: 'center', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '1rem 1.5rem', borderRadius: '0.75rem', marginBottom: '2rem', textAlign: 'center', fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      {/* SECCIÓN 1: MIS BILLETERAS Y SALDO */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>💳</span> Mis Billeteras Activas
        </h2>

        {isLoadingWallet ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Cargando tus billeteras...</div>
        ) : billeteras.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', borderRadius: '0.75rem' }}>
            No tienes billeteras vinculadas en este momento.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {billeteras.map((b, idx) => {
              const isPrincipal = idx === 0;
              const nombreMetodo = b.metodoPago?.descripcion || b.metodoPago?.tipo || 'Tarjeta Virtual';
              const saldoNum = Number(b.saldo || 0);

              return (
                <div key={b.id} style={{ background: isPrincipal ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(52,211,153,0.15))' : 'rgba(255,255,255,0.02)', border: `1px solid ${isPrincipal ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '1rem', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                  {isPrincipal && (
                    <span style={{ position: 'absolute', top: '12px', right: '12px', background: '#6366f1', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', textTransform: 'uppercase' }}>
                      Principal
                    </span>
                  )}
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{nombreMetodo}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>ID: {b.id.slice(0, 12)}...</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: isPrincipal ? '#34d399' : '#cbd5e1' }}>
                    ${saldoNum.toLocaleString('es-CO')}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* RECARGAR SALDO */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: '#f1f5f9' }}>Añadir Saldo a Billetera Principal</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Monto a recargar ($ COP)</label>
              <input 
                type="number" value={amount} onChange={e => setAmount(Number(e.target.value))}
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }} 
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flex: '1 1 250px' }}>
              {[10000, 20000, 50000].map(val => (
                <button key={val} onClick={() => setAmount(val)} style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                  +${val / 1000}k
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              onClick={handleDirectRecharge} disabled={isProcessingDirect || amount < 1000}
              style={{ flex: 1, minWidth: '220px', background: 'rgba(255,255,255,0.05)', color: '#34d399', border: '1px solid #34d399', padding: '1rem', borderRadius: '0.5rem', cursor: (isProcessingDirect || amount < 1000) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1rem', transition: 'all 0.2s', opacity: (isProcessingDirect || amount < 1000) ? 0.6 : 1 }}
            >
              {isProcessingDirect ? 'Procesando...' : '⚡ Recarga Directa (Bono/Taquilla)'}
            </button>
            <button 
              onClick={() => navigate('/cartera/pago', { state: { amount } })} disabled={amount < 1000}
              style={{ flex: 1, minWidth: '220px', background: '#6366f1', color: 'white', border: 'none', padding: '1rem', borderRadius: '0.5rem', cursor: amount < 1000 ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)', transition: 'all 0.2s', opacity: amount < 1000 ? 0.6 : 1 }}
            >
              🔒 Recargar con ePayco
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: CATÁLOGO DE MÉTODOS DE PAGO DEL SERVICIO BACKEND */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🏷️</span> Métodos de Pago Disponibles (Catálogo Backend)
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Explora y afilia nuevas opciones de pago ofrecidas por el servicio de transporte.
        </p>

        {isLoadingCatalogo ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Cargando catálogo de métodos...</div>
        ) : catalogo.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', borderRadius: '0.75rem' }}>
            No hay métodos de pago adicionales en el catálogo en este momento.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {catalogo.map(metodo => {
              const yaVinculado = billeteras.some(b => b.metodoPago?.id === metodo.id);

              return (
                <div key={metodo.id} style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1.1rem' }}>{metodo.descripcion || metodo.tipo}</span>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.6rem', borderRadius: '0.35rem', color: '#cbd5e1' }}>
                        {metodo.tipo}
                      </span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
                      ID Ref: {metodo.id.slice(0, 8)}...
                    </p>
                  </div>

                  <button 
                    onClick={() => handleLinkMethod(metodo.id)} disabled={isLinking || yaVinculado}
                    style={{ width: '100%', padding: '0.8rem', background: yaVinculado ? 'rgba(255,255,255,0.05)' : '#10b981', color: yaVinculado ? '#64748b' : 'white', border: yaVinculado ? '1px solid rgba(255,255,255,0.1)' : 'none', borderRadius: '0.5rem', cursor: (isLinking || yaVinculado) ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}
                  >
                    {yaVinculado ? '✓ Ya Vinculado' : isLinking ? 'Vinculando...' : '+ Vincular Método'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RechargePage;
