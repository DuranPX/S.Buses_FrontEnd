// src/notifications/NotificationsSocketProvider.tsx
//
// Contexto que expone el socket hacia ms-notifications (services/socketService.ts).
// Es un socket DISTINTO al de ms-business (websocket/socket.ts + SocketProvider):
//   - appSocket (websocket/socket.ts)      → ms-business, namespace /transport.
//                                              Tracking GPS, abordajes, turnos, etc.
//   - notificationsSocket (este provider)  → ms-notifications (puerto 5002, sin
//                                              namespace). Webhooks de alertas,
//                                              mensajes y, ahora, las alertas de
//                                              "bus a X minutos" por paradero.
//
// Se conecta automáticamente cuando hay un usuario autenticado (token en
// localStorage), igual que appSocket lo hace desde AuthContext.
//
// El estado de conexión se sincroniza con useSyncExternalStore (en vez de
// setState dentro de un useEffect): el socket es una fuente de verdad
// externa a React, y este hook es exactamente para ese caso.
import { createContext, useContext, useRef, useSyncExternalStore, type ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import { socketService } from '../services/socketService';
import { useAuth } from '../features/auth/hooks/useAuth';

interface NotificationsSocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const NotificationsSocketContext = createContext<NotificationsSocketContextValue>({
  socket: null,
  isConnected: false,
});

/**
 * Se conecta (si hace falta) y devuelve el socket actual. No es un hook: es
 * una función auxiliar que solo toca el singleton `socketService`, llamada
 * desde dentro de `getSnapshot`/efectos de useSyncExternalStore.
 */
const ensureConnected = (isAuthenticated: boolean): Socket | null => {
  if (!isAuthenticated) return socketService.getSocket();

  const token = localStorage.getItem('token');
  if (!token) return socketService.getSocket();

  return socketService.connect(token);
};

export const NotificationsSocketProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();

  // useSyncExternalStore exige que getSnapshot devuelva una referencia
  // estable mientras el valor no cambie (si no, entra en loop). Cacheamos
  // el último snapshot calculado y solo creamos uno nuevo si el socket o su
  // estado de conexión realmente cambiaron.
  const lastSnapshotRef = useRef<NotificationsSocketContextValue | null>(null);

  const subscribe = (callback: () => void) => {
    const socket = ensureConnected(isAuthenticated);
    if (!socket) return () => {};

    socket.on('connect', callback);
    socket.on('disconnect', callback);
    return () => {
      socket.off('connect', callback);
      socket.off('disconnect', callback);
    };
  };

  const getSnapshot = (): NotificationsSocketContextValue => {
    const socket = ensureConnected(isAuthenticated);
    const isConnected = socket?.connected ?? false;
    const last = lastSnapshotRef.current;

    if (last && last.socket === socket && last.isConnected === isConnected) {
      return last;
    }

    const next = { socket, isConnected };
    lastSnapshotRef.current = next;
    return next;
  };

  const value = useSyncExternalStore(subscribe, getSnapshot);

  return (
    <NotificationsSocketContext.Provider value={value}>
      {children}
    </NotificationsSocketContext.Provider>
  );
};

export const useNotificationsSocket = (): NotificationsSocketContextValue =>
  useContext(NotificationsSocketContext);