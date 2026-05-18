import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { empresasService } from '../services/empresasService';
import axios from 'axios';

const CreateEmpresaPage = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !nit) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await empresasService.create({ nombre, nit });
      navigate('/admin/empresas');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // Manejar 409 Conflict u otros errores del backend
        setError(err.response?.data?.message || 'Error al registrar la empresa. Verifica los datos e intenta nuevamente.');
      } else {
        setError('Error al registrar la empresa. Verifica los datos e intenta nuevamente.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem', color: '#f8fafc' }}>
            Registrar Empresa de Transporte
          </h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Da de alta una nueva empresa operadora para poder asociarle buses de la flota.
          </p>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '2.5rem', maxWidth: '600px' }}>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Nombre de la Empresa *</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={e => setNombre(e.target.value)} 
              placeholder="Ej. Transportes El Rápido S.A." 
              required
              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1.1rem' }} 
            />
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>NIT *</label>
            <input 
              type="text" 
              value={nit} 
              onChange={e => setNit(e.target.value)} 
              placeholder="Ej. 800123456-7" 
              required
              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1.1rem', fontFamily: 'monospace' }} 
            />
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
              El NIT debe ser único. Si ya existe en el sistema, se notificará un conflicto.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={() => navigate('/admin/empresas')}
              style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '1rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isProcessing || !nombre || !nit}
              style={{ background: '#6366f1', color: 'white', padding: '1rem 2rem', borderRadius: '0.5rem', border: 'none', cursor: (isProcessing || !nombre || !nit) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1rem', opacity: (isProcessing || !nombre || !nit) ? 0.7 : 1, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
            >
              {isProcessing ? 'Registrando...' : 'Registrar Empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmpresaPage;
