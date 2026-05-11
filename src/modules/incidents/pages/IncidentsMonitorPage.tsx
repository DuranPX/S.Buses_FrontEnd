import { useState } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { IncidentCard } from '../components/IncidentCard';
import { Loader } from '../../../shared/components/ui/Loader';
import { incidentsMockService } from '../services/incidentsMockService';

const IncidentsMonitorPage = () => {
  const { incidents, isLoading, error, refetch } = useIncidents(true); // true = admin view
  const [filter, setFilter] = useState<string>('Todos');

  const handleStatusChange = async (id: string, newStatus: any) => {
    try {
      await incidentsMockService.updateStatus(id, newStatus);
      // refetch se hace automáticamente porque el hook escucha el WS_EVENTS.INCIDENT_UPDATED
      // pero por si acaso, el mockService actualiza en memoria y el WS dispara el evento localmente
      // si isMockSocket es true, pero en este caso podríamos llamar refetch
      refetch();
    } catch (err) {
      console.error(err);
      alert('Error al actualizar estado');
    }
  };

  const filteredIncidents = incidents.filter(i => {
    if (filter === 'Todos') return true;
    if (filter === 'Pendientes') return i.estado === 'Reportado' || i.estado === 'En_Revision';
    return i.estado === filter;
  });

  return (
    <div style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            Monitor de Incidentes
          </h1>
          <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
            Centro de control y gestión en tiempo real.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '0.5rem' }}>
          {['Todos', 'Pendientes', 'Resuelto'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: filter === f ? '#f8fafc' : '#94a3b8',
                border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 600
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Loader />
        </div>
      ) : error ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
          {error}
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>✅</span>
          <h3 style={{ margin: '0 0 0.5rem', color: '#f8fafc' }}>Todo bajo control</h3>
          <p style={{ margin: 0 }}>No hay incidentes reportados para este filtro.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem', overflowY: 'auto', paddingBottom: '2rem' }}>
          {filteredIncidents.map(inc => (
            <IncidentCard 
              key={inc.id} 
              incident={inc} 
              isAdmin={true} 
              onStatusChange={handleStatusChange} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentsMonitorPage;
