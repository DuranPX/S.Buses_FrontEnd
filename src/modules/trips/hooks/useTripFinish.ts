import { useState } from 'react';
import { tripsMockService } from '../services/tripsMockService';
import type { Trip } from '../types/trip.types';

export const useTripFinish = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finishTrip = async (boletoId: string, destinoId: string): Promise<Trip | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const trip = await tripsMockService.finishTrip(boletoId, destinoId);
      return trip;
    } catch (err: any) {
      setError(err.message || 'Error al finalizar el viaje.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { finishTrip, isLoading, error };
};
