import { useEffect, useState } from 'react';
import { socketService } from '../services/socketService';
import { Socket } from 'socket.io-client';

export const useSocket = (token?: string) => {
  const [socket, setSocket] = useState<Socket | null>(socketService.getSocket());
  const [isConnected, setIsConnected] = useState<boolean>(socket ? socket.connected : false);

  useEffect(() => {
    // Solo intentar conectar si se provee un token y no hay un socket activo.
    let currentSocket = socketService.getSocket();
    
    if (!currentSocket && token) {
      currentSocket = socketService.connect(token);
      setSocket(currentSocket);
    }

    if (!currentSocket) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    currentSocket.on('connect', onConnect);
    currentSocket.on('disconnect', onDisconnect);

    // Initial state
    setIsConnected(currentSocket.connected);

    return () => {
      currentSocket?.off('connect', onConnect);
      currentSocket?.off('disconnect', onDisconnect);
    };
  }, [token]);

  return { socket, isConnected };
};
