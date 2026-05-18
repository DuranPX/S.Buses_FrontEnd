import { useState } from 'react';
import { ticketsService } from '../../tickets/services/ticketsService';

export const useTripFinish = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finishTrip = async (boletoId: string, destinoId: string): Promise<any | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const trip = await ticketsService.registerDescenso(boletoId, destinoId);
      
      // LIMPIEZA: Eliminamos el boleto activo de la persistencia
      localStorage.removeItem('active_ticket_id');
      localStorage.removeItem('active_ticket_ruta');
      
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