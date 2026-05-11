import { useState, useEffect, useCallback } from 'react';
import { ticketsMockService } from '../services/ticketsMockService';
import type { Ticket } from '../types/ticket.types';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketsMockService.getMyTickets();
      setTickets(data);
    } catch {
      setError('No se pudieron cargar tus boletos activos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  return { tickets, isLoading, error, refetch: fetchTickets };
};
