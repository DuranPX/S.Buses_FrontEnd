import { useState } from 'react';
import { tripsService } from '../services/tripsService'; // ← nombre actualizado
import type { Trip } from '../types/trip.types';

export const useTripFinish = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finishTrip = async (boletoId: string, destinoId: string): Promise<Trip | null> => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: conectar al backend real cuando se implemente HU-004
      // const trip = await tripsService.finishTrip(boletoId, destinoId);
      throw new Error('Funcionalidad pendiente de implementación.');
    } catch (err: any) {
      setError(err.message || 'Error al finalizar el viaje.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { finishTrip, isLoading, error };
};