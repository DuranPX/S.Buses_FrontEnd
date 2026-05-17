import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessApi } from '../../../../api/api';
import { useAuth } from '../../../../features/auth/hooks/useAuth';
import QRCode from 'react-qr-code';

const CreateBusPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    anio: new Date().getFullYear(),
    capacidad_total: 40,
    capacidad_sentados: 30,
    capacidad_parados: 10,
    estado: 'Operativo',
    foto_url: '',
  });

  const handleSave = async () => {
    if (!formData.placa || !formData.modelo) {
      return alert('Placa y modelo son obligatorios');
    }
    setIsProcessing(true);
    try {
      const { data } = await businessApi.post('/bus', {
        ...formData,
        // La empresa se asocia desde el JWT en el backend
      });

      // El QR contiene el ID del bus generado por el backend
      const qrValue = `BUS:${data.id}:${data.placa}`;
      setGeneratedQR(qrValue);

      // Actualizar el bus con el qr_code generado
      await businessApi.patch(`/bus/${data.id}`, { qr_code: qrValue });

      setTimeout(() => navigate('/admin/buses'), 2000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error al registrar el bus.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc' }}>Registrar Bus</h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>Da de alta un nuevo bus y genera su código QR.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {[
            { label: 'Placa', key: 'placa', type: 'text', placeholder: 'ABC-123' },
            { label: 'Modelo', key: 'modelo', type: 'text', placeholder: 'Ej. Mercedes Benz O500' },
            { label: 'Año', key: 'anio', type: 'number', placeholder: '2024' },
            { label: 'Capacidad Total', key: 'capacidad_total', type: 'number', placeholder: '40' },
            { label: 'Capacidad Sentados', key: 'capacidad_sentados', type: 'number', placeholder: '30' },
            { label: 'Capacidad Parados', key: 'capacidad_parados', type: 'number', placeholder: '10' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>{label}</label>
              <input
                type={type}
                value={(formData as any)[key]}
                onChange={e => setFormData({ ...formData, [key]: type === 'number' ? Number(e.target.value) : e.target.value.toUpperCase() })}
                placeholder={placeholder}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
          ))}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Estado Inicial</label>
            <select
              value={formData.estado}
              onChange={e => setFormData({ ...formData, estado: e.target.value })}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            >
              <option value="Operativo">Operativo</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Fuera_Servicio">Fuera de Servicio</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={isProcessing || formData.placa.length < 5}
            style={{ width: '100%', background: '#6366f1', color: 'white', padding: '1rem', borderRadius: '0.5rem', border: 'none', cursor: (isProcessing || formData.placa.length < 5) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1rem', opacity: (isProcessing || formData.placa.length < 5) ? 0.7 : 1, marginTop: '0.5rem' }}
          >
            {isProcessing ? 'Registrando...' : 'Registrar y Generar QR'}
          </button>
        </div>

        {/* QR Panel */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>
            {generatedQR ? '✅ QR Generado' : 'Preview QR de Identificación'}
          </p>
          <div style={{ width: '160px', height: '160px', background: 'white', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {generatedQR ? (
              <QRCode value={generatedQR} size={140} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '4px' }}>
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} style={{ background: i % 2 === 0 ? '#e2e8f0' : 'transparent' }} />
                ))}
              </div>
            )}
          </div>
          <span style={{ fontWeight: 700, color: '#f8fafc', letterSpacing: '2px' }}>
            {formData.placa || 'XXX-000'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CreateBusPage;