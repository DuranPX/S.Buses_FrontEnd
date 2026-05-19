import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { busesService } from '../services/busesService';
import { empresasService, type Empresa } from '../../empresas/services/empresasService';
import QRCode from 'react-qr-code';
import axios from 'axios';

const CreateBusPage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  
  // Listado de empresas para el selector (cumpliendo con la asociación de empresa en ms-business)
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoadingEmpresas, setIsLoadingEmpresas] = useState(true);
  const [empresaId, setEmpresaId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    anio: new Date().getFullYear(),
    capacidad_total: 40,
    capacidad_sentados: 30,
    capacidad_parados: 10,
    estado: 'Operativo',
    foto_url: 'https://picsum.photos/400/300',
  });

  useEffect(() => {
    const fetchEmpresas = async () => {
      setIsLoadingEmpresas(true);
      try {
        const data = await empresasService.getAll();
        setEmpresas(data);
        if (data.length > 0) {
          setEmpresaId(data[0].id); // Seleccionar la primera por defecto
        }
      } catch {
        setError('No se pudieron cargar las empresas. Asegúrate de haber registrado al menos una empresa primero.');
      } finally {
        setIsLoadingEmpresas(false);
      }
    };
    fetchEmpresas();
  }, []);

  const handleCapacidadTotalChange = (val: number) => {
    const sentados = Math.round(val * 0.75);
    setFormData(prev => ({
      ...prev,
      capacidad_total: val,
      capacidad_sentados: sentados,
      capacidad_parados: val - sentados
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placa || !formData.modelo || !empresaId) {
      alert('Placa, modelo y empresa operadora son obligatorios');
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      // Generar URL para vista rápida de validación en frontend según requerimiento
      const qrValue = `http://localhost:5000/validar/bus/${formData.placa}`;

      await busesService.create({
        ...formData,
        empresaId,
        qr_code: qrValue
      });

      setGeneratedQR(qrValue);

      // Redirigir al listado de flota tras 2 segundos
      setTimeout(() => navigate('/admin/buses'), 2000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Error al registrar el bus. Verifica que la placa no esté duplicada.');
      } else {
        alert('Error al registrar el bus.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto', height: '100%' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc' }}>Registrar Bus en Flota</h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>Da de alta un nuevo bus, asócialo a una empresa y genera su código QR de validación.</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Selector de Empresa */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>Empresa Operadora *</label>
            {isLoadingEmpresas ? (
              <div style={{ padding: '0.8rem', color: '#94a3b8', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem' }}>Cargando empresas...</div>
            ) : empresas.length === 0 ? (
              <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                No hay empresas registradas. <button type="button" onClick={() => navigate('/admin/empresas/crear')} style={{ background: 'transparent', border: 'none', color: '#6366f1', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700, padding: 0 }}>Registrar una empresa aquí</button>
              </div>
            ) : (
              <select 
                value={empresaId} 
                onChange={e => setEmpresaId(e.target.value)} 
                required
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', cursor: 'pointer' }}
              >
                <option value="" disabled>Selecciona una empresa</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id} style={{ background: '#1e293b', color: 'white' }}>
                    {emp.nombre} (NIT: {emp.nit})
                  </option>
                ))}
              </select>
            )}
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>El bus quedará asignado directamente a esta empresa en el backend.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>Placa del Bus *</label>
              <input 
                type="text" 
                value={formData.placa} 
                onChange={e => setFormData({ ...formData, placa: e.target.value.toUpperCase() })} 
                placeholder="ABC-123" 
                required
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>Estado Inicial *</label>
              <select 
                value={formData.estado} 
                onChange={e => setFormData({ ...formData, estado: e.target.value })}
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', cursor: 'pointer' }}
              >
                <option value="Operativo" style={{ background: '#1e293b', color: 'white' }}>Operativo</option>
                <option value="Mantenimiento" style={{ background: '#1e293b', color: 'white' }}>Mantenimiento</option>
                <option value="Fuera_Servicio" style={{ background: '#1e293b', color: 'white' }}>Fuera de Servicio</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>Modelo del Bus *</label>
              <input 
                type="text" 
                value={formData.modelo} 
                onChange={e => setFormData({ ...formData, modelo: e.target.value })} 
                placeholder="Ej. Mercedes Benz O500" 
                required
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>Año de Fabricación *</label>
              <input 
                type="number" 
                value={formData.anio} 
                onChange={e => setFormData({ ...formData, anio: parseInt(e.target.value) || 2026 })} 
                min={1950} 
                max={2030}
                required
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }} 
              />
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#f8fafc', fontWeight: 600 }}>Distribución de Capacidad</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Capacidad Total</label>
                <input 
                  type="number" 
                  value={formData.capacidad_total} 
                  onChange={e => handleCapacidadTotalChange(parseInt(e.target.value) || 0)} 
                  min={1}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#34d399', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Pasajeros Sentados</label>
                <input 
                  type="number" 
                  value={formData.capacidad_sentados} 
                  onChange={e => setFormData({ ...formData, capacidad_sentados: parseInt(e.target.value) || 0 })} 
                  min={0}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1.1rem', textAlign: 'center' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Pasajeros Parados</label>
                <input 
                  type="number" 
                  value={formData.capacidad_parados} 
                  onChange={e => setFormData({ ...formData, capacidad_parados: parseInt(e.target.value) || 0 })} 
                  min={0}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1.1rem', textAlign: 'center' }} 
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>URL de Fotografía del Bus</label>
            <input 
              type="url" 
              value={formData.foto_url} 
              onChange={e => setFormData({ ...formData, foto_url: e.target.value })} 
              placeholder="https://picsum.photos/400/300" 
              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.95rem' }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button 
              type="button" 
              onClick={() => navigate('/admin/buses')}
              style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '1rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isProcessing || !formData.placa || !empresaId || empresas.length === 0}
              style={{ background: '#6366f1', color: 'white', padding: '1rem 2rem', borderRadius: '0.5rem', border: 'none', cursor: (isProcessing || !formData.placa || !empresaId || empresas.length === 0) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1rem', opacity: (isProcessing || !formData.placa || !empresaId || empresas.length === 0) ? 0.7 : 1, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
            >
              {isProcessing ? 'Registrando...' : 'Registrar y Generar QR'}
            </button>
          </div>
        </div>

        {/* Panel Lateral: Vista Previa y QR */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {generatedQR ? '✅ QR Generado Exitosamente' : 'Vista Previa QR de Identificación'}
          </p>

          <div style={{ width: '100%', height: '160px', borderRadius: '0.75rem', overflow: 'hidden', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {formData.foto_url ? (
              <img src={formData.foto_url} alt="Preview Bus" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.currentTarget.style.display = 'none'} />
            ) : (
              <span style={{ fontSize: '3rem' }}>🚌</span>
            )}
          </div>

          <div style={{ width: '160px', height: '160px', background: 'white', padding: '0.75rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
            {generatedQR ? (
              <QRCode value={generatedQR} size={136} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', width: '100%', height: '100%' }}>
                {Array.from({length: 25}).map((_, i) => (
                  <div key={i} style={{ background: (i % 2 === 0 && i % 3 !== 0) ? '#cbd5e1' : (i % 7 === 0 ? '#cbd5e1' : 'transparent'), borderRadius: '2px' }}></div>
                ))}
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontWeight: 800, color: '#f8fafc', fontSize: '1.4rem', letterSpacing: '3px' }}>{formData.placa || 'XXX-000'}</span>
            <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>{formData.modelo || 'Modelo'} • {formData.anio || 'Año'}</span>
            {empresaId && empresas.find(e => e.id === empresaId) && (
              <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '2px 8px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                {empresas.find(e => e.id === empresaId)?.nombre}
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBusPage;