import { useState, useEffect, useCallback } from 'react';
import { businessApi } from '../../../api/api';
import { useSocket } from '../../../websocket/hooks/useSocket';
import { WS_EVENTS } from '../../../websocket/events';
import type { DriverShift, BusCondition } from '../types/driver.types';

const adaptTurno = (turno: any): DriverShift => ({
  id: turno.id,
  conductor_id: turno.conductor?.id || '',
  bus_id: turno.bus?.id || '',
  fecha_inicio_programada: turno.fecha_inicio_programada,
  fecha_fin_programada: turno.fecha_fin_programada,
  fecha_inicio_real: turno.fecha_inicio_real || null,
  fecha_fin_real: turno.fecha_fin_real || null,
  estado: turno.estado,
  observaciones: turno.observaciones || '',
  conductor_nombre: turno.conductor?.persona
    ? `${turno.conductor.persona.firstName} ${turno.conductor.persona.lastName}`
    : undefined,
  bus_placa: turno.bus?.placa,
});

export const useDriverShift = () => {
  const [shift, setShift] = useState<DriverShift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchShift = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // El backend obtiene el conductor desde el JWT — no enviamos conductor_id
      const { data } = await businessApi.get('/turno/conductor/activo');
      setShift(adaptTurno(data));
    } catch {
      setError('No hay turnos programados para hoy.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchShift(); }, [fetchShift]);

  // Escuchar evento WebSocket cuando el turno se inicia
  useSocket(WS_EVENTS.SHIFT_STARTED, (_data: any) => {
      fetchShift();
  });

  const startShift = async (condition: BusCondition) => {
    if (!shift) return false;
    setIsProcessing(true);
    setError(null);
    try {
      const observaciones = [
        condition.observaciones,
        `Combustible: ${condition.nivel_combustible}%`,
        `Llantas: ${condition.presion_llantas}`,
        `Luces: ${condition.luces}`,
        `Frenos: ${condition.frenos}`,
        `Limpieza: ${condition.limpieza}`,
      ].filter(Boolean).join(' | ');

      const { data } = await businessApi.patch(
        `/turno/${shift.id}/iniciar`,
        { observaciones }
      );
      setShift(adaptTurno(data));
      return true;
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        'Error al iniciar turno. Verifica el estado del bus.'
      );
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const endShift = async () => {
    if (!shift) return false;
    setIsProcessing(true);
    try {
      await businessApi.patch(`/turno/${shift.id}/finalizar`);
      setShift(null);
      return true;
    } catch {
      setError('Error al finalizar turno.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return { shift, isLoading, error, isProcessing, startShift, endShift, refetch: fetchShift };
};