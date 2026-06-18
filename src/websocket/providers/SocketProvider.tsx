import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { notificationsSocket, appSocket } from '../socket';
import type { AppSocket } from '../socket';

const SocketContext = createContext<AppSocket | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    // Conectar ambos sockets al montar la app
    notificationsSocket.connect();
    appSocket.connect();

    return () => {
      notificationsSocket.disconnect();
      appSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={notificationsSocket}>
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Hook para el socket de ms-notifications (puerto 5002).
 * Usado para: tracking GPS, alertas de paradero, mensajes masivos.
 */
export const useSocketContext = (): AppSocket => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocketContext debe usarse dentro de <SocketProvider>');
  return ctx;
};