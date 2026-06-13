import { useEffect } from 'react';
import { socketService } from '../services/socketService';

/**
 * Hook para unirse explícitamente a un canal/sala adicional si la arquitectura
 * del backend requiere que el frontend envíe un evento tipo 'join_channel'.
 * (En nuestro ms-notifications, las salas base se asignan en el handshake,
 * pero este hook es útil si hay canales dinámicos).
 */
export const useChannel = (channelName: string) => {
  useEffect(() => {
    const socket = socketService.getSocket();
    
    if (!socket || !socket.connected) {
      return;
    }

    socket.emit('join_channel', { channel: channelName });

    return () => {
      socket.emit('leave_channel', { channel: channelName });
    };
  }, [channelName]);
};
