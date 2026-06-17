import { useState, useEffect, useCallback } from 'react';
import { incidentsService } from '../services/incidentsService';
import type { Incidente } from '../types/incident.types';
import { useSocket } from '../../../websocket/hooks/useSocket';
import { WS_EVENTS } from '../../../websocket/events';

export const useIncidents = (isAdmin = false) => {
  const [incidents, setIncidents] = useState<Incidente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // El service real solo tiene getAll — para admin y conductor es la misma lista
      const data = await incidentsService.getAll();
      setIncidents(data);
    } catch {
      setError('Error al cargar los incidentes.');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  // Escuchar nuevos incidentes en tiempo real (para monitoreo admin)
  useSocket<Incidente>(WS_EVENTS.INCIDENT_CREATED, (newIncident) => {
    if (isAdmin) {
      setIncidents(prev => [newIncident, ...prev]);
    }
  });

  // Escuchar actualizaciones de estado en tiempo real
  useSocket<Incidente>(WS_EVENTS.INCIDENT_UPDATED, (updatedIncident) => {
    setIncidents(prev => prev.map(inc =>
      inc.id === updatedIncident.id ? updatedIncident : inc
    ));
  });

  return { incidents, isLoading, error, refetch: fetchIncidents };
};