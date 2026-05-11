import { useState, useEffect, useCallback } from 'react';
import { incidentsMockService } from '../services/incidentsMockService';
import type { Incident } from '../types/incident.types';
import { useSocket } from '../../../websocket/hooks/useSocket';
import { WS_EVENTS } from '../../../websocket/events';

export const useIncidents = (isAdmin = false) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = isAdmin 
        ? await incidentsMockService.getAll()
        : await incidentsMockService.getMyIncidents();
      setIncidents(data);
    } catch {
      setError('Error al cargar los incidentes.');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  // Escuchar nuevos incidentes (para monitoreo admin)
  useSocket<Incident>(WS_EVENTS.INCIDENT_CREATED, (newIncident) => {
    if (isAdmin) {
      setIncidents(prev => [newIncident, ...prev]);
    }
  });

  // Escuchar actualizaciones de estado
  useSocket<Incident>(WS_EVENTS.INCIDENT_UPDATED, (updatedIncident) => {
    setIncidents(prev => prev.map(inc => inc.id === updatedIncident.id ? updatedIncident : inc));
  });

  return { incidents, isLoading, error, refetch: fetchIncidents };
};
