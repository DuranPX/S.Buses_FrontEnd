// ================================================================
// useTickets.ts — Módulo Boletos
// Hook que reemplaza el anterior que usaba ticketsMockService.
// Ahora usa ticketsService (backend real).
// ================================================================

import { useState, useEffect, useCallback } from 'react';
import { ticketsService } from '../services/ticketsService';
import type { Ticket } from '../types/ticket.types';

// Ajusta este import al hook/contexto de sesión de tu proyecto.
// Si tienes un AuthContext, extrae el id del ciudadano desde ahí.
// Ejemplo: import { useAuth } from '../../auth/context/AuthContext';
// Por ahora lo leemos desde localStorage como fallback universal.
function useCiudadanoId(): string | undefined {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    // Ajusta la key según la forma de tu objeto de sesión
    return parsed?.id ?? parsed?.ciudadano_id ?? parsed?.sub ?? undefined;
  } catch {
    return undefined;
  }
}

export const useTickets = () => {
  const ciudadanoId = useCiudadanoId();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketsService.getMyTickets(ciudadanoId);
      // Mostramos solo activos en la pantalla principal de boletos
      setTickets(data.filter(t => t.estado === 'ACTIVO'));
    } catch {
      setError('No se pudieron cargar tus boletos. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  }, [ciudadanoId]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const cancelTicket = useCallback(async (id: string) => {
    try {
      await ticketsService.cancelTicket(id);
      // Refrescamos la lista completa
      await fetchTickets();
    } catch (e: unknown) {
      throw new Error((e as Error).message);
    }
  }, [fetchTickets]);

  return { tickets, isLoading, error, refetch: fetchTickets, cancelTicket };
};