// src/modules/incidents/components/IncidentForm.tsx
import { useState } from 'react';
import type { CreateIncidenteDto, TipoIncidente, GravedadIncidente } from '../types/incident.types';
import { useGeolocation } from '../../stops/hooks/useGeolocation';

interface Props {
  onSubmit: (data: CreateIncidenteDto, fotos: File[]) => Promise<void>;
  isProcessing: boolean;
}

const TIPOS: { value: TipoIncidente; label: string }[] = [
  { value: 'Mecánico',  label: '🔧 Mecánico' },
  { value: 'Accidente', label: '🚨 Accidente' },
  { value: 'Retraso',   label: '⏰ Retraso' },
  { value: 'Otro',      label: '📋 Otro' },
];

const GRAVEDADES: { value: GravedadIncidente; label: string; color: string }[] = [
  { value: 'Bajo',    label: 'Bajo',    color: '#22c55e' },
  { value: 'Medio',   label: 'Medio',   color: '#f59e0b' },
  { value: 'Alto',    label: 'Alto',    color: '#f97316' },
  { value: 'Crítico', label: 'Crítico', color: '#ef4444' },
];

export const IncidentForm = ({ onSubmit, isProcessing }: Props) => {
  const { location, error: geoError } = useGeolocation();

  const [tipo, setTipo]           = useState<TipoIncidente>('Otro');
  const [gravedad, setGravedad]   = useState<GravedadIncidente>('Bajo');
  const [descripcion, setDesc]    = useState('');
  const [fotos, setFotos]         = useState<File[]>([]);
  const [previews, setPreviews]   = useState<string[]>([]);

  const MAX_FOTOS = 5;

  const handleFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const disponibles = MAX_FOTOS - fotos.length;
    const nuevas = selected.slice(0, disponibles);

    setFotos(prev => [...prev, ...nuevas]);
    setPreviews(prev => [...prev, ...nuevas.map(f => URL.createObjectURL(f))]);

    // Reset input para permitir seleccionar el mismo archivo
    e.target.value = '';
  };

  const handleRemoveFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim() || !location) return;

    onSubmit({
      tipo,
      gravedad,
      descripcion,
      latitud: location.lat,
      longitud: location.lng,
    }, fotos);
  };

  const selectStyle = {
    width: '100%', padding: '0.8rem', borderRadius: '0.5rem',
    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', fontSize: '0.95rem',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.85rem',
    color: '#94a3b8', marginBottom: '0.5rem',
  };

  const canSubmit = descripcion.trim() && location && !isProcessing;

  return (
    <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Tipo */}
      <div>
        <label style={labelStyle}>Tipo de incidente *</label>
        <select value={tipo} onChange={e => setTipo(e.target.value as TipoIncidente)} style={selectStyle}>
          {TIPOS.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Gravedad */}
      <div>
        <label style={labelStyle}>Nivel de gravedad *</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {GRAVEDADES.map(g => (
            <button
              key={g.value} type="button"
              onClick={() => setGravedad(g.value)}
              style={{
                padding: '0.6rem', borderRadius: '0.5rem', border: `2px solid`,
                borderColor: gravedad === g.value ? g.color : 'rgba(255,255,255,0.1)',
                background: gravedad === g.value ? g.color + '22' : 'rgba(0,0,0,0.2)',
                color: gravedad === g.value ? g.color : '#94a3b8',
                cursor: 'pointer', fontWeight: gravedad === g.value ? 700 : 400,
                fontSize: '0.85rem', transition: 'all 0.2s',
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label style={labelStyle}>Descripción *</label>
        <textarea
          value={descripcion} onChange={e => setDesc(e.target.value)} required
          placeholder="Describe lo sucedido detalladamente..."
          style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '120px', resize: 'vertical', fontSize: '0.95rem', boxSizing: 'border-box' }}
        />
      </div>

      {/* Fotos */}
      <div>
        <label style={labelStyle}>
          Evidencia fotográfica ({fotos.length}/{MAX_FOTOS})
        </label>

        {/* Previews */}
        {previews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {previews.map((src, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <img src={src} alt={`foto-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button" onClick={() => handleRemoveFoto(i)}
                  style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}
                >✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Input para agregar más fotos */}
        {fotos.length < MAX_FOTOS && (
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100px', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '0.5rem', cursor: 'pointer', background: 'rgba(0,0,0,0.2)' }}>
            <span style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📷</span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              {fotos.length === 0 ? 'Agregar fotos' : `Agregar más (${MAX_FOTOS - fotos.length} restantes)`}
            </span>
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple onChange={handleFotos} style={{ display: 'none' }} />
          </label>
        )}
      </div>

      {/* Ubicación */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: location ? '#10b981' : '#f59e0b' }}>
        <span>📍</span>
        {location
          ? `Ubicación adjuntada (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`
          : geoError || 'Obteniendo ubicación GPS...'}
      </div>

      {/* Sin ubicación */}
      {!location && (
        <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: 0 }}>
          ⚠️ Se requiere ubicación GPS para reportar un incidente. Activa el permiso de ubicación en tu navegador.
        </p>
      )}

      {/* Botón */}
      <button
        type="submit" disabled={!canSubmit}
        style={{
          width: '100%', background: canSubmit ? '#ef4444' : '#ef444488',
          color: 'white', padding: '1rem', borderRadius: '0.5rem',
          border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
          fontWeight: 700, fontSize: '1.1rem',
        }}
      >
        {isProcessing ? 'Enviando reporte...' : 'Enviar Reporte de Incidente'}
      </button>

    </form>
  );
};