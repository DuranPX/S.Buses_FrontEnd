import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateBusPage = () => {
  const navigate = useNavigate();
  const [placa, setPlaca] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSave = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/admin/buses');
    }, 1000);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem', color: '#f8fafc' }}>
            Registrar Bus
          </h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Da de alta un nuevo bus y genera su código QR identificador.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Placa del Bus</label>
            <input 
              type="text" value={placa} onChange={e => setPlaca(e.target.value.toUpperCase())} placeholder="ABC-123" 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase' }} 
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Capacidad Pasajeros</label>
            <input type="number" defaultValue={40} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>

          <button 
            onClick={handleSave} disabled={isProcessing || placa.length < 6}
            style={{ width: '100%', background: '#6366f1', color: 'white', padding: '1rem', borderRadius: '0.5rem', border: 'none', cursor: (isProcessing || placa.length < 6) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1.1rem', opacity: (isProcessing || placa.length < 6) ? 0.7 : 1 }}
          >
            {isProcessing ? 'Registrando...' : 'Registrar y Generar QR'}
          </button>
        </div>

        {/* QR Preview Panel */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>
            Preview QR de Identificación
          </p>
          <div style={{ width: '150px', height: '150px', background: 'white', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Fake QR using text */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', width: '100%', height: '100%' }}>
              {Array.from({length: 25}).map((_, i) => (
                <div key={i} style={{ background: Math.random() > 0.5 ? 'black' : 'transparent' }}></div>
              ))}
            </div>
          </div>
          <span style={{ marginTop: '1rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '2px' }}>{placa || 'XXX-000'}</span>
        </div>
      </div>
    </div>
  );
};

export default CreateBusPage;
