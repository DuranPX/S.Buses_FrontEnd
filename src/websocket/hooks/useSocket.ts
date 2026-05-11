import { useEffect } from 'react';
import { useSocketContext } from '../providers/SocketProvider';
import type { WsEvent } from '../events';

/**
 * Hook base para suscribirse a un evento WebSocket con cleanup automático.
 *
 * @param event  Nombre del evento (usar WS_EVENTS para type safety)
 * @param handler Callback que recibe el payload del evento
 *
 * @example
 * useSocket(WS_EVENTS.BUS_LOCATION_UPDATED, (data) => {
 *   setLocation(data);
 * });
 */
export const useSocket = <T = unknown>(
  event: WsEvent | string,
  handler: (data: T) => void
) => {
  const socket = useSocketContext();

  useEffect(() => {
    socket.on(event, handler as (...args: any[]) => void);
    return () => {
      socket.off(event, handler as (...args: any[]) => void);
    };
  }, [event, handler, socket]);
};
