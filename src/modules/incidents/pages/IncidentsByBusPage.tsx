// src/modules/incidents/pages/IncidentsByBusPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { incidentsService } from '../services/incidentsService';
import { showAlert } from '../../../shared/utils/alerts';
import { IncidentCard } from '../components/IncidentCard';
import type { Incidente, IncidenteBus } from '../types/incident.types';

const IncidentsByBusPage = () => {
  const { id } = useParams<{ id: string }>();
  const [incidenteBuses, setIncidenteBuses] = useState<IncidenteBus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchIncidentes = async () => {
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

    fetchIncidentes();
  }, [id]);

  const incidentes: Incidente[] = incidenteBuses
    .map(ib => ib.incidente)
    .filter((inc, index, self) => self.findIndex(i => i.id === inc.id) === index);

  const handleStatusChange = async (incId: string, estado: Incidente['estado']) => {
    try {
      await incidentsService.updateEstado(incId, estado);
      const data = await incidentsService.getByBus(id!);
      setIncidenteBuses(data);
    } catch {
      showAlert.error('Error', 'No se pudo actualizar el estado del incidente');
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem', color: '#f8fafc' }}>
          Incidentes del Bus
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Historial de incidentes reportados para este bus.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '4rem 1rem' }}>
          Cargando incidentes...
        </div>
      ) : incidentes.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>✅</span>
          <h3 style={{ margin: '0 0 0.5rem', color: '#f8fafc' }}>Sin incidentes</h3>
          <p style={{ margin: 0 }}>Este bus no tiene incidentes registrados.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {incidentes.map(inc => (
            <IncidentCard
              key={inc.id}
              incident={inc}
              isAdmin
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default IncidentsByBusPage;