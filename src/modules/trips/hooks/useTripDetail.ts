// src/modules/trips/hooks/useTripDetail.ts
import { useState, useEffect } from 'react';
import { tripsService } from '../services/tripsService';
import type { Trip } from '../types/trip.types';

export const useTripDetail = (id: string | undefined) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    tripsService
      .getTripDetail(id)
      .then(setTrip)
      .catch(() => setError('Error al cargar el detalle del viaje.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { trip, isLoading, error };
};