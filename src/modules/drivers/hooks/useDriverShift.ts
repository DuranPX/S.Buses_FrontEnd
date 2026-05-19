// src/modules/drivers/hooks/useDriverShift.ts
// Reemplaza el archivo completo:
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
  puedeIniciar: turno.puedeIniciar ?? false,
});

export const useDriverShift = () => {
  const [shifts, setShifts] = useState<DriverShift[]>([]);
  const [shift, setShift] = useState<DriverShift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // canStartShift usa el campo puedeIniciar que viene del backend,
  // con fallback a la lógica local por compatibilidad
  const canStartShift = (turno: DriverShift): boolean => {
    if ('puedeIniciar' in turno) return !!(turno as any).puedeIniciar;
    const ahora = new Date();
    const horaInicio = new Date(turno.fecha_inicio_programada);
    horaInicio.setMinutes(horaInicio.getMinutes() - 10);
    return ahora >= horaInicio && turno.estado === 'PROGRAMADO';
  };

  const fetchAllShifts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await businessApi.get('/turno/conductor/mis-turnos');
      const adapted = data.map(adaptTurno);
      setShifts(adapted);

      const turnoEnCurso = adapted.find((t: DriverShift) => t.estado === 'EN_CURSO') || null;
      setShift(turnoEnCurso);
    } catch {
      setShifts([]);
      setShift(null);
      setError('No hay turnos programados para hoy.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchShift = fetchAllShifts;

  useEffect(() => { fetchAllShifts(); }, [fetchAllShifts]);

  useSocket(WS_EVENTS.SHIFT_STARTED, () => { fetchAllShifts(); });
  useSocket(WS_EVENTS.SHIFT_ENDED, () => { fetchAllShifts(); });

  const startShift = async (turnoId: string, condition: BusCondition) => {
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
        `/turno/${turnoId}/iniciar`,
        { observaciones }
      );
      const adapted = adaptTurno(data);
      setShift(adapted);
      setShifts(prev => prev.map(s => s.id === turnoId ? adapted : s));
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al iniciar turno.');
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
      await fetchAllShifts();
      return true;
    } catch {
      setError('Error al finalizar turno.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    shifts,
    shift,
    isLoading,
    error,
    isProcessing,
    startShift,
    endShift,
    fetchShift,
    canStartShift,
  };
};