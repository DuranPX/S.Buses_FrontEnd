import { useState } from 'react';
import { useSchedules } from '../hooks/useSchedules';
import { ScheduleCard } from '../components/ScheduleCard';
import { Loader } from '../../../shared/components/ui/Loader';

const SchedulesPublicPage = () => {
  const [busqueda, setBusqueda] = useState('');
  const { schedules, total, loading, error } = useSchedules(busqueda);

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem', color: '#f8fafc' }}>
          Horarios de Servicio
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Consulta las programaciones activas de rutas y buses.
        </p>
      </div>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar por ruta, código o placa del bus..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        style={{
          width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem',
          background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'white', fontSize: '0.95rem', boxSizing: 'border-box',
        }}
      />

      {/* Contenido */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader />
        </div>
      ) : error ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem' }}>
          {error}
        </div>
      ) : schedules.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🕐</span>
          <h3 style={{ margin: '0 0 0.5rem', color: '#f8fafc' }}>
            {busqueda ? 'Sin resultados' : 'Sin horarios disponibles'}
          </h3>
          <p style={{ margin: 0 }}>
            {busqueda ? 'Intenta con otro término.' : 'No hay programaciones activas en este momento.'}
          </p>
        </div>
      ) : (
        <>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
            {schedules.length} de {total} horario{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {schedules.map(p => (
              <ScheduleCard key={p.id} schedule={p} />
            ))}
          </div>
        </>
      )}

    </div>
  );
};

export default SchedulesPublicPage;