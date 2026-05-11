import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateSchedulePage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSave = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate(-1);
    }, 1000);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem', color: '#f8fafc' }}>
            Asignar Programación
          </h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Conecta una ruta con un bus y un conductor en un horario específico.
          </p>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Ruta</label>
          <select style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
            <option>R-01: Terminal - Centro</option>
            <option>R-02: Enea - Cable</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Bus</label>
          <select style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
            <option>ABC-123 (Cap: 40)</option>
            <option>DEF-456 (Cap: 35)</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Conductor</label>
          <select style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
            <option>Carlos Ramírez</option>
            <option>Alejandro Torres</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Hora de Inicio</label>
            <input type="time" defaultValue="06:00" style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Hora de Fin Estimada</label>
            <input type="time" defaultValue="14:00" style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>
        </div>

        <button 
          onClick={handleSave} disabled={isProcessing}
          style={{ width: '100%', background: '#6366f1', color: 'white', padding: '1rem', borderRadius: '0.5rem', border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1.1rem', opacity: isProcessing ? 0.7 : 1 }}
        >
          {isProcessing ? 'Guardando...' : 'Crear Programación'}
        </button>
      </div>
    </div>
  );
};

export default CreateSchedulePage;
