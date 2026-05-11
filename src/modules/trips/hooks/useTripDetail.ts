import { useState, useEffect } from 'react';
import { tripsMockService } from '../services/tripsMockService';
import type { Trip } from '../types/trip.types';

export const useTripDetail = (id: string | undefined) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    tripsMockService.getTripDetail(id).then(data => {
      if (!data) setError('Viaje no encontrado.');
      else setTrip(data);
    }).catch(() => {
      setError('Error al cargar el detalle del viaje.');
    }).finally(() => setIsLoading(false));
  }, [id]);

  return { trip, isLoading, error };
};
