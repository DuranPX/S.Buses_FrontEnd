import { useState, useEffect } from 'react';
import { businessApi } from '../../../api/api';
import { useAuthorization } from '../../../features/roles/hooks/useAuthorization';
import { useSocket } from '../../../websocket/hooks/useSocket';
import { WS_EVENTS } from '../../../websocket/events';

/**
 * Hook ligero para el Sidebar — solo verifica si hay turno EN_CURSO.
 * No carga todos los datos del turno para no afectar el rendimiento.
 */
export const useDriverShiftStatus = () => {
  const { activeRole } = useAuthorization();
  const isDriver = activeRole?.name?.toUpperCase() === 'CONDUCTOR';
  const [turnoEnCurso, setTurnoEnCurso] = useState(false);

  const checkStatus = async () => {
    if (!isDriver) { setTurnoEnCurso(false); return; }
    try {
      const { data } = await businessApi.get('/turno/conductor/mis-turnos');
      setTurnoEnCurso(data.some((t: any) => t.estado === 'EN_CURSO'));
    } catch {
      setTurnoEnCurso(false);
    }
  };

  useEffect(() => { checkStatus(); }, [isDriver]);

  // Actualizar cuando cambie el estado del turno por WebSocket
  useSocket(WS_EVENTS.SHIFT_STARTED, () => setTurnoEnCurso(true));
  useSocket(WS_EVENTS.SHIFT_ENDED, () => setTurnoEnCurso(false));

  return { turnoEnCurso };
};