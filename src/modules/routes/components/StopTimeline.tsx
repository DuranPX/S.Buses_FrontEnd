import type { RouteStop } from '../types/route.types';

interface Props { stops: RouteStop[]; }

export const StopTimeline = ({ stops }: Props) => {
  const sorted = [...stops].sort((a, b) => a.orden - b.orden);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {sorted.map((rs, idx) => (
        <div key={rs.paradero.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          {/* Línea vertical + dot */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '28px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.75rem',
              background: idx === 0 ? '#10b981' : idx === sorted.length - 1 ? '#f59e0b' : '#6366f1',
              color: 'white', border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 0 8px rgba(99,102,241,0.4)',
            }}>
              {rs.orden}
            </div>
            {idx < sorted.length - 1 && (
              <div style={{ width: '2px', flexGrow: 1, minHeight: '24px', background: 'rgba(99,102,241,0.3)', margin: '2px 0' }} />
            )}
          </div>

          {/* Info del paradero */}
          <div style={{ paddingBottom: idx < sorted.length - 1 ? '1rem' : 0, flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{rs.paradero.nombre}</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
              {rs.paradero.tipo}
              {rs.distancia_desde_anterior > 0 && ` · +${rs.distancia_desde_anterior} km`}
              {rs.tiempo_estimado > 0 && ` · +${rs.tiempo_estimado} min`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
