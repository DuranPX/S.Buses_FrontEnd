import { useNavigate } from 'react-router-dom';
import type { Trip } from '../types/trip.types';

interface Props {
  trip: Trip;
}

export const TripCard = ({ trip }: Props) => {
  const navigate = useNavigate();
  const dateStr = new Date(trip.fecha_descenso).toLocaleString('es-CO', { 
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <div
      onClick={() => navigate(`/viajes/${trip.id}`)}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1rem', padding: '1.25rem',
        cursor: 'pointer', transition: 'all 0.2s',
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
      }}
      onMouseEnter={e => (e.currentTarget.style.border = '1px solid #10b981')}
      onMouseLeave={e => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{dateStr}</span>
        <span style={{ fontWeight: 700, color: '#34d399' }}>${trip.tarifa_pagada.toLocaleString('es-CO')}</span>
      </div>

      <div>
        <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}>
            {trip.ruta_codigo}
          </span>
          {trip.ruta_nombre}
        </h4>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ color: '#10b981' }}>○</span>
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{trip.origen_nombre}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ color: '#f59e0b' }}>○</span>
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{trip.destino_nombre}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
        <span>⏱ {trip.duracion_minutos} min</span>
        {trip.distancia_km && <span>📏 {trip.distancia_km} km</span>}
      </div>
    </div>
  );
};
