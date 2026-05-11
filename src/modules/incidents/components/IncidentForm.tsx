import { useState } from 'react';
import type { Incident } from '../types/incident.types';
import { useGeolocation } from '../../stops/hooks/useGeolocation';

interface Props {
  onSubmit: (data: Partial<Incident>, file?: File) => Promise<void>;
  isProcessing: boolean;
}

export const IncidentForm = ({ onSubmit, isProcessing }: Props) => {
  const { location, error: geoError } = useGeolocation();
  const [tipo, setTipo] = useState<Incident['tipo']>('Otro');
  const [descripcion, setDescripcion] = useState('');
  const [file, setFile] = useState<File | undefined>();
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) return;

    onSubmit({
      tipo,
      descripcion,
      latitud: location?.lat || null,
      longitud: location?.lng || null,
      reportador_id: 'u-001', // mock
    }, file);
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Tipo de Incidente</label>
        <select value={tipo} onChange={e => setTipo(e.target.value as any)} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
          <option value="Accidente">Accidente</option>
          <option value="Falla_Mecanica">Falla Mecánica</option>
          <option value="Comportamiento">Mal Comportamiento</option>
          <option value="Retraso">Retraso Excesivo</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Descripción</label>
        <textarea 
          value={descripcion} onChange={e => setDescripcion(e.target.value)} required
          placeholder="Describe lo sucedido detalladamente..."
          style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '100px', resize: 'vertical' }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Evidencia Fotográfica (Opcional)</label>
        
        {!preview ? (
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '120px', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '0.5rem', cursor: 'pointer', background: 'rgba(0,0,0,0.2)' }}>
            <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</span>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Haz clic para subir una foto</span>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        ) : (
          <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <img src={preview} alt="Evidencia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button type="button" onClick={() => { setFile(undefined); setPreview(null); }} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: location ? '#10b981' : '#f59e0b' }}>
        <span>📍</span>
        {location 
          ? `Ubicación adjuntada automáticamente (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` 
          : geoError || 'Obteniendo ubicación...'}
      </div>

      <button 
        type="submit" disabled={isProcessing || !descripcion.trim()}
        style={{ width: '100%', background: '#ef4444', color: 'white', padding: '1rem', borderRadius: '0.5rem', border: 'none', cursor: (isProcessing || !descripcion.trim()) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1.1rem', opacity: (isProcessing || !descripcion.trim()) ? 0.7 : 1 }}
      >
        {isProcessing ? 'Enviando Reporte...' : 'Enviar Reporte de Incidente'}
      </button>
    </form>
  );
};
