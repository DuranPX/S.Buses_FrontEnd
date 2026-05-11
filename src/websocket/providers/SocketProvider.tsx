import { createContext, useContext, type ReactNode } from 'react';
import { appSocket } from '../socket';
import type { Socket } from 'socket.io-client';

// Tipo unificado compatible con MockSocket y Socket real
type AnySocket = Pick<Socket, 'on' | 'off' | 'emit' | 'connected' | 'id'>;

const SocketContext = createContext<AnySocket | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SocketContext.Provider value={appSocket as unknown as AnySocket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = (): AnySocket => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocketContext debe usarse dentro de <SocketProvider>');
  return ctx;
};
