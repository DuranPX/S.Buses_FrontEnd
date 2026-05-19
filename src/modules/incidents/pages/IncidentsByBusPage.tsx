// src/modules/incidents/pages/IncidentsByBusPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { incidentsService } from '../services/incidentsService';
import { showAlert } from '../../../shared/utils/alerts';
import { IncidentCard } from '../components/IncidentCard';
import { Loader } from '../../../shared/components/ui/Loader';
import type { Incidente, IncidenteBus, TipoIncidente } from '../types/incident.types';

type FiltroEstado = 'Todos' | 'Pendiente' | 'En_Revision' | 'Resuelto';
type FiltroTipo   = 'Todos' | TipoIncidente;

const IncidentsByBusPage = () => {
  const { id } = useParams<{ id: string }>();
  const [incidenteBuses, setIncidenteBuses] = useState<IncidenteBus[]>([]);
  const [loading, setLoading]               = useState(true);
  const [filtroEstado, setFiltroEstado]     = useState<FiltroEstado>('Todos');
  const [filtroTipo, setFiltroTipo]         = useState<FiltroTipo>('Todos');

  const fetchIncidentes = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await incidentsService.getByBus(id);
      setIncidenteBuses(data);
    } catch {
      showAlert.error('Error', 'No se pudieron cargar los incidentes de este bus');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncidentes(); }, [id]);

  // Incidentes únicos deduplicados
  const todosLosIncidentes: Incidente[] = useMemo(() =>
    incidenteBuses
      .map(ib => ib.incidente)
      .filter((inc, index, self) => self.findIndex(i => i.id === inc.id) === index),
    [incidenteBuses]
  );

  // Filtros aplicados
  const incidentesFiltrados = useMemo(() =>
    todosLosIncidentes.filter(inc => {
      const porEstado = filtroEstado === 'Todos' || inc.estado === filtroEstado;
      const porTipo   = filtroTipo   === 'Todos' || inc.tipo   === filtroTipo;
      return porEstado && porTipo;
    }),
    [todosLosIncidentes, filtroEstado, filtroTipo]
  );

  // Estadísticas
  const stats = useMemo(() => {
    const total    = todosLosIncidentes.length;
    const resueltos = todosLosIncidentes.filter(i => i.estado === 'Resuelto').length;
    const porTipo  = todosLosIncidentes.reduce((acc, i) => {
      acc[i.tipo] = (acc[i.tipo] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      resueltos,
      pendientes:      todosLosIncidentes.filter(i => i.estado === 'Pendiente').length,
      enRevision:      todosLosIncidentes.filter(i => i.estado === 'En_Revision').length,
      tasaResolucion:  total > 0 ? Math.round((resueltos / total) * 100) : 0,
      porTipo,
    };
  }, [todosLosIncidentes]);

  const handleStatusChange = async (incId: string, estado: Incidente['estado']) => {
    try {
      await incidentsService.updateEstado(incId, estado);
      await fetchIncidentes();
    } catch {
      showAlert.error('Error', 'No se pudo actualizar el estado del incidente');
    }
  };

  const selectStyle = {
    padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', fontSize: '0.85rem',
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem', color: '#f8fafc' }}>
          Incidentes del Bus
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Historial de incidentes reportados para este bus.
        </p>
      </div>

      {/* Estadísticas */}
      {!loading && todosLosIncidentes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[
            { label: 'Total',        value: stats.total,          color: '#a5b4fc' },
            { label: 'Pendientes',   value: stats.pendientes,     color: '#ef4444' },
            { label: 'En Revisión',  value: stats.enRevision,     color: '#f59e0b' },
            { label: 'Tasa resolución', value: `${stats.tasaResolucion}%`, color: '#10b981' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tipos de incidente */}
      {!loading && Object.keys(stats.porTipo).length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1rem' }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>Por tipo</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {Object.entries(stats.porTipo).map(([tipo, cantidad]) => (
              <span key={tipo} style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem' }}>
                {tipo}: {cantidad}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      {!loading && todosLosIncidentes.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Filtrar:</span>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value as FiltroEstado)} style={selectStyle}>
            <option value="Todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En_Revision">En Revisión</option>
            <option value="Resuelto">Resuelto</option>
          </select>
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value as FiltroTipo)} style={selectStyle}>
            <option value="Todos">Todos los tipos</option>
            <option value="Mecánico">Mecánico</option>
            <option value="Accidente">Accidente</option>
            <option value="Retraso">Retraso</option>
            <option value="Otro">Otro</option>
          </select>
          {(filtroEstado !== 'Todos' || filtroTipo !== 'Todos') && (
            <button
              onClick={() => { setFiltroEstado('Todos'); setFiltroTipo('Todos'); }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
            >
              Limpiar filtros
            </button>
          )}
          <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: 'auto' }}>
            {incidentesFiltrados.length} de {todosLosIncidentes.length} incidente{todosLosIncidentes.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader />
        </div>
      ) : incidentesFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>
            {todosLosIncidentes.length === 0 ? '✅' : '🔍'}
          </span>
          <h3 style={{ margin: '0 0 0.5rem', color: '#f8fafc' }}>
            {todosLosIncidentes.length === 0 ? 'Sin incidentes' : 'Sin resultados'}
          </h3>
          <p style={{ margin: 0 }}>
            {todosLosIncidentes.length === 0
              ? 'Este bus no tiene incidentes registrados.'
              : 'No hay incidentes que coincidan con los filtros seleccionados.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {incidentesFiltrados.map(inc => (
            <IncidentCard
              key={inc.id}
              incident={inc}
              isAdmin
              onStatusChange={handleStatusChange}
              onUpdate={(updated) => {
                setIncidenteBuses(prev =>
                  prev.map(ib =>
                    ib.incidente.id === updated.id
                      ? { ...ib, incidente: updated }
                      : ib
                  )
                );
              }}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default IncidentsByBusPage;