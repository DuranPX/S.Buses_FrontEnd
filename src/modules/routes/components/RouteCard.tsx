import { useNavigate } from 'react-router-dom';
import type { Route } from '../types/route.types';

interface Props { route: Route; }

const statusBadge = (activa: boolean) => (
  <span style={{
    padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600,
    background: activa ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
    color: activa ? '#34d399' : '#f87171', border: `1px solid ${activa ? '#34d399' : '#f87171'}`,
  }}>
    {activa ? 'Activa' : 'Inactiva'}
  </span>
);

export const RouteCard = ({ route }: Props) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/rutas/${route.id}`)}
      style={{
        background: 'var(--glass-bg, rgba(255,255,255,0.04))',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1rem', padding: '1.25rem 1.5rem',
        cursor: 'pointer', transition: 'all 0.2s',
        display: 'flex', flexDirection: 'column', gap: '0.6rem',
      }}
      onMouseEnter={e => (e.currentTarget.style.border = '1px solid #6366f1')}
      onMouseLeave={e => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)')}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', marginRight: '0.5rem' }}>
            {route.codigo}
          </span>
          {statusBadge(route.estado)}
        </div>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a5b4fc' }}>
          ${route.tarifa.toLocaleString('es-CO')}
        </span>
      </div>

      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{route.nombre}</h3>
      <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.5 }}>
        {route.descripcion}
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.25rem' }}>
        <span>⏱ {route.tiempo_estimado_total || 0} min</span>
      </div>
    </div>
  );
};
