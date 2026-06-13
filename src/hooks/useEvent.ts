import { useEffect } from 'react';
import { socketService } from '../services/socketService';

export const useEvent = <T>(eventName: string, callback: (data: T) => void) => {
  useEffect(() => {
    const socket = socketService.getSocket();
    
    if (!socket) {
      console.warn(`useEvent: Intento de escuchar el evento '${eventName}' pero no hay socket inicializado.`);
      return;
    }

    // Registrar el listener
    socket.on(eventName, callback);

    // Limpiar el listener al desmontar el componente o si cambian dependencias
    return () => {
      socket.off(eventName, callback);
    };
  }, [eventName, callback]);
};
