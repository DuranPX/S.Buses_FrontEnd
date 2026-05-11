import { useState, useEffect, useCallback } from 'react';
import { tripsMockService } from '../services/tripsMockService';
import type { Trip } from '../types/trip.types';

export const useTripHistory = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tripsMockService.getHistory();
      setTrips(data);
    } catch {
      setError('No se pudo cargar el historial de viajes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  return { trips, isLoading, error, refetch: fetchHistory };
};
