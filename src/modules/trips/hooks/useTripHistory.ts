import { useState, useEffect, useCallback } from 'react';
import { tripsService } from '../services/tripsService'; // ← nombre actualizado
import { useAuth } from '../../../features/auth/hooks/useAuth'; // ← agregar
import type { Trip } from '../types/trip.types';

export const useTripHistory = () => {
  const { user } = useAuth(); // ← para obtener el ciudadanoId
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user?.id) return; // ← esperar a que el usuario esté disponible
    setIsLoading(true);
    setError(null);
    try {
      const data = await tripsService.getHistory(user.id); // ← pasar el id
      setTrips(data);
    } catch {
      setError('No se pudo cargar el historial de viajes.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]); // ← dependencia del id

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  return { trips, isLoading, error, refetch: fetchHistory };
};