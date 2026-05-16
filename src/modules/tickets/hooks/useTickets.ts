// ================================================================
// useTickets.ts — Módulo Boletos
// Hook que consume ticketsService (backend real, autenticado via JWT).
// El backend identifica al ciudadano desde el token; no se pasa ID manualmente.
// ================================================================

import { useState, useEffect, useCallback } from 'react';
import { ticketsService } from '../services/ticketsService';
import type { Ticket } from '../types/ticket.types';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Sin ciudadanoId: el backend filtra por el usuario del JWT
      const data = await ticketsService.getMyTickets();
      setTickets(data.filter(t => t.estado === 'Activo'));
    } catch {
      setError('No se pudieron cargar tus boletos. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const cancelTicket = useCallback(async (id: string) => {
    try {
      await ticketsService.cancelTicket(id);
      await fetchTickets();
    } catch (e: unknown) {
      throw new Error((e as Error).message);
    }
  }, [fetchTickets]);

  return { tickets, isLoading, error, refetch: fetchTickets, cancelTicket };
};