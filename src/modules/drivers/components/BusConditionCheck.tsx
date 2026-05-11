import { useState } from 'react';
import type { BusCondition } from '../types/driver.types';

interface Props {
  onSubmit: (condition: BusCondition) => void;
  isProcessing: boolean;
}

export const BusConditionCheck = ({ onSubmit, isProcessing }: Props) => {
  const [condition, setCondition] = useState<BusCondition>({
    nivel_combustible: 100,
    presion_llantas: 'OK',
    luces: 'OK',
    frenos: 'OK',
    limpieza: 'Buena',
    observaciones: ''
  });

  const handleChange = (field: keyof BusCondition, value: any) => {
    setCondition(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(condition);
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', color: '#f8fafc' }}>
        Checklist de Estado del Bus
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Nivel de Combustible (%)</label>
          <input 
            type="range" min="0" max="100" 
            value={condition.nivel_combustible}
            onChange={e => handleChange('nivel_combustible', Number(e.target.value))}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
          <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#e2e8f0' }}>{condition.nivel_combustible}%</div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Presión Llantas</label>
          <select value={condition.presion_llantas} onChange={e => handleChange('presion_llantas', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
            <option value="OK">OK</option>
            <option value="Revisar">Revisar</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Sistema de Luces</label>
          <select value={condition.luces} onChange={e => handleChange('luces', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
            <option value="OK">OK</option>
            <option value="Falla">Falla</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Frenos</label>
          <select value={condition.frenos} onChange={e => handleChange('frenos', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
            <option value="OK">OK</option>
            <option value="Revisar">Revisar</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Estado de Limpieza</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {['Buena', 'Regular', 'Mala'].map(opt => (
            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" name="limpieza" value={opt} checked={condition.limpieza === opt} onChange={e => handleChange('limpieza', e.target.value)} />
              <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Observaciones adicionales</label>
        <textarea 
          value={condition.observaciones}
          onChange={e => handleChange('observaciones', e.target.value)}
          placeholder="Algún rayón, objeto perdido, etc."
          style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '80px', resize: 'vertical' }}
        />
      </div>

      <button 
        type="submit"
        disabled={isProcessing}
        style={{ width: '100%', background: '#6366f1', color: 'white', padding: '1rem', borderRadius: '0.5rem', border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1.1rem', opacity: isProcessing ? 0.7 : 1 }}
      >
        {isProcessing ? 'Procesando...' : 'Registrar Estado e Iniciar Turno'}
      </button>
    </form>
  );
};
