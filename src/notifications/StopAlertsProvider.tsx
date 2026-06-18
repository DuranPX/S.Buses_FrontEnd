// src/notifications/StopAlertsProvider.tsx
//
// Fuente única de verdad para las alertas de paradero ("bus a X minutos"),
// montada una sola vez a nivel de toda la app (ver main.tsx). Resuelve dos
// problemas que tenía la versión anterior (estado por componente +
// localStorage):
//
//   1. Si el ciudadano navega a otra página (p.ej. /cartera/recarga)
//      mientras su alerta sigue activa, este Provider sigue escuchando
//      'stop_alert_triggered' igual — porque vive en main.tsx, no dentro
//      de la página de la ruta. Antes, al no estar montado el componente
//      de la ruta, el evento se perdía silenciosamente para la UI (la
//      notificación push del navegador sí seguía llegando, porque esa
//      depende solo del Service Worker).
//
//   2. Al volver a la página de la ruta (o recargar), el estado de "ya se
//      disparó" se mantiene correctamente, porque viene de este estado
//      centralizado (y, al reconectar, de 'stop_alerts_listed' que manda
//      el backend) en vez de una copia vieja en localStorage que nunca se
//      actualizaba cuando la alerta se disparaba.

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNotificationsSocket } from './NotificationsSocketProvider';
import { showStopAlertNotification } from './pushNotifications';
import type {
  AnticipacionMin,
  StopAlertErrorPayload,
  StopAlertSubscription,
  StopAlertTriggeredPayload,
} from '../modules/alerts/types/alert.types';

interface StopAlertState {
  subscription: StopAlertSubscription;
  lastTriggered: StopAlertTriggeredPayload | null;
}

/** Clave compuesta para indexar por ruta+paradero. */
const key = (routeId: string, stopId: string) => `${routeId}::${stopId}`;

interface StopAlertsContextValue {
  /** Mapa route+stop -> estado actual de la alerta (si existe). */
  alerts: Map<string, StopAlertState>;
  isLoaded: boolean;
  subscribe: (params: {
    routeId: string;
    stopId: string;
    anticipationMin: AnticipacionMin;
  }) => Promise<void>;
  unsubscribe: (routeId: string, stopId: string) => void;
  /** Errores de la última operación de suscripción (para mostrar en la UI que la pidió). */
  lastError: string | null;
}

const StopAlertsContext = createContext<StopAlertsContextValue | null>(null);

export const StopAlertsProvider = ({ children }: { children: ReactNode }) => {
  const { socket, isConnected } = useNotificationsSocket();

  const [alerts, setAlerts] = useState<Map<string, StopAlertState>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const pendingResolveRef = useRef<{
    resolve: () => void;
    reject: (err: Error) => void;
  } | null>(null);

  // Al conectar (o reconectar), pedimos explícitamente la lista de
  // suscripciones activas. El backend también la manda automáticamente al
  // conectar (stop_alerts_listed, vía claim_subscriptions_for_user), pero
  // pedirla explícitamente cubre el caso de reconexiones donde por algún
  // motivo no llegara ese push inicial.
  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.emit('list_stop_alerts');
  }, [socket, isConnected]);

  useEffect(() => {
    if (!socket) return;

    const upsertSubscription = (sub: StopAlertSubscription) => {
      setAlerts((prev) => {
        const next = new Map(prev);
        const k = key(sub.route_id, sub.stop_id);
        const existing = next.get(k);
        next.set(k, { subscription: sub, lastTriggered: existing?.lastTriggered ?? null });
        return next;
      });
    };

    const handleConfirmed = (sub: StopAlertSubscription) => {
      upsertSubscription(sub);
      setLastError(null);
      pendingResolveRef.current?.resolve();
      pendingResolveRef.current = null;
    };

    const handleError = (payload: StopAlertErrorPayload) => {
      setLastError(payload.message);
      pendingResolveRef.current?.reject(new Error(payload.message));
      pendingResolveRef.current = null;
    };

    const handleUnsubscribed = (payload: { subscription_id: string; removed: boolean }) => {
      setAlerts((prev) => {
        const next = new Map(prev);
        for (const [k, state] of next) {
          if (state.subscription.id === payload.subscription_id) {
            next.delete(k);
            break;
          }
        }
        return next;
      });
    };

    const handleTriggered = async (payload: StopAlertTriggeredPayload) => {
      const k = key(payload.route_id, payload.stop_id);

      setAlerts((prev) => {
        const next = new Map(prev);
        const existing = next.get(k);
        if (existing) {
          next.set(k, { ...existing, lastTriggered: payload });
        }
        return next;
      });

      // Se dispara la notificación push una sola vez aquí, sin importar
      // qué página esté abierta — antes esto vivía dentro del componente
      // de la ruta y se perdía si el ciudadano había navegado a otra parte.
      await showStopAlertNotification({
        title: payload.title,
        body: payload.body,
        data: {
          subscriptionId: payload.subscription_id,
          routeId: payload.route_id,
          stopId: payload.stop_id,
          busId: payload.bus_id,
          placa: payload.placa,
          etaMin: payload.eta_min,
        },
      });
    };

    const handleListed = (payload: { subscriptions: StopAlertSubscription[] }) => {
      setAlerts((prev) => {
        const next = new Map(prev);
        for (const sub of payload.subscriptions ?? []) {
          const k = key(sub.route_id, sub.stop_id);
          const existing = next.get(k);
          next.set(k, { subscription: sub, lastTriggered: existing?.lastTriggered ?? null });
        }
        return next;
      });
      setIsLoaded(true);
    };

    socket.on('stop_alert_confirmed', handleConfirmed);
    socket.on('stop_alert_error', handleError);
    socket.on('stop_alert_unsubscribed', handleUnsubscribed);
    socket.on('stop_alert_triggered', handleTriggered);
    socket.on('stop_alerts_listed', handleListed);

    return () => {
      socket.off('stop_alert_confirmed', handleConfirmed);
      socket.off('stop_alert_error', handleError);
      socket.off('stop_alert_unsubscribed', handleUnsubscribed);
      socket.off('stop_alert_triggered', handleTriggered);
      socket.off('stop_alerts_listed', handleListed);
    };
  }, [socket]);

  const subscribe = async (params: {
    routeId: string;
    stopId: string;
    anticipationMin: AnticipacionMin;
  }): Promise<void> => {
    if (!socket || !isConnected) {
      setLastError('No hay conexión con el servicio de notificaciones. Intenta de nuevo.');
      return;
    }

    setLastError(null);

    return new Promise<void>((resolve, reject) => {
      pendingResolveRef.current = { resolve, reject };
      socket.emit('subscribe_stop_alert', {
        route_id: params.routeId,
        stop_id: params.stopId,
        anticipation_min: params.anticipationMin,
      });
    });
  };

  const unsubscribe = (routeId: string, stopId: string) => {
    const state = alerts.get(key(routeId, stopId));
    if (!socket || !state) return;
    socket.emit('unsubscribe_stop_alert', { subscription_id: state.subscription.id });
  };

  return (
    <StopAlertsContext.Provider value={{ alerts, isLoaded, subscribe, unsubscribe, lastError }}>
      {children}
    </StopAlertsContext.Provider>
  );
};

/** Acceso de bajo nivel al contexto completo (todas las alertas). */
export const useStopAlertsContext = (): StopAlertsContextValue => {
  const ctx = useContext(StopAlertsContext);
  if (!ctx) throw new Error('useStopAlertsContext debe usarse dentro de <StopAlertsProvider>');
  return ctx;
};