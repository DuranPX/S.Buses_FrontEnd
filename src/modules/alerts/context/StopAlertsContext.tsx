// src/modules/alerts/context/StopAlertsContext.tsx
//
// Fuente de verdad ÚNICA y GLOBAL para las alertas de paradero ("bus a X
// minutos"). Reemplaza el enfoque anterior (estado por componente +
// localStorage como respaldo), que tenía dos problemas:
//
//   1. Si el ciudadano navegaba a otra página, el componente que escuchaba
//      'stop_alert_triggered' se desmontaba, y el disparo se perdía para
//      la UI (aunque el push del navegador sí seguía llegando, porque eso
//      depende solo del Service Worker).
//   2. Al volver a montar el componente (recargar, o regresar a la
//      página), se restauraba el estado "no disparado" guardado
//      previamente, perdiendo el hecho de que la alerta ya se había
//      cumplido.
//
// Este Provider vive montado en toda la app (ver main.tsx), así que
// siempre hay un único listener activo para estos eventos, sin importar
// en qué página esté el ciudadano. Al conectar, pide 'list_stop_alerts'
// para reconstruir el estado completo desde el backend (que es la fuente
// de verdad real), en vez de depender de una copia local desincronizable.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNotificationsSocket } from '../../../notifications/NotificationsSocketProvider';
import {
  registerServiceWorker,
  requestNotificationPermission,
  showStopAlertNotification,
  getNotificationPermission,
} from '../../../notifications/pushNotifications';
import type {
  AnticipacionMin,
  StopAlertErrorPayload,
  StopAlertSubscription,
  StopAlertTriggeredPayload,
} from '../types/alert.types';

/** Estado consolidado de una alerta para una ruta+paradero específicos. */
export interface StopAlertState {
  subscription: StopAlertSubscription | null;
  /** Último disparo recibido para esta suscripción, si ya se cumplió. */
  lastTrigger: StopAlertTriggeredPayload | null;
}

const EMPTY_STATE: StopAlertState = { subscription: null, lastTrigger: null };

const key = (routeId: string, stopId: string) => `${routeId}::${stopId}`;

interface StopAlertsContextValue {
  /** Mapa clave (routeId::stopId) -> estado de esa alerta. */
  alerts: Map<string, StopAlertState>;
  permisoNotificaciones: NotificationPermission | 'unsupported';
  activarAlerta: (params: {
    routeId: string;
    stopId: string;
    anticipationMin: AnticipacionMin;
  }) => Promise<void>;
  desactivarAlerta: (subscriptionId: string, routeId: string, stopId: string) => void;
  isSubscribing: boolean;
  error: string | null;
}

const StopAlertsContext = createContext<StopAlertsContextValue | null>(null);

export const StopAlertsProvider = ({ children }: { children: ReactNode }) => {
  const { socket, isConnected } = useNotificationsSocket();

  const [alerts, setAlerts] = useState<Map<string, StopAlertState>>(new Map());
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permisoNotificaciones, setPermisoNotificaciones] = useState <
    NotificationPermission | 'unsupported'
  >(getNotificationPermission());

  const pendingResolveRef = useRef<{
    resolve: () => void;
    reject: (err: Error) => void;
  } | null>(null);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Helper para actualizar una sola entrada del Map sin perder las demás.
  const updateAlert = useCallback(
    (routeId: string, stopId: string, updater: (prev: StopAlertState) => StopAlertState) => {
      setAlerts((prevMap) => {
        const k = key(routeId, stopId);
        const prev = prevMap.get(k) ?? EMPTY_STATE;
        const next = new Map(prevMap);
        next.set(k, updater(prev));
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    if (!socket) return;

    const handleConfirmed = (sub: StopAlertSubscription) => {
      updateAlert(sub.route_id, sub.stop_id, (prev) => ({
        ...prev,
        subscription: sub,
      }));
      setIsSubscribing(false);
      setError(null);
      pendingResolveRef.current?.resolve();
      pendingResolveRef.current = null;
    };

    const handleErrorEvt = (payload: StopAlertErrorPayload) => {
      setError(payload.message);
      setIsSubscribing(false);
      pendingResolveRef.current?.reject(new Error(payload.message));
      pendingResolveRef.current = null;
    };

    const handleUnsubscribed = (payload: { subscription_id: string; removed: boolean }) => {
      setAlerts((prevMap) => {
        const next = new Map(prevMap);
        for (const [k, state] of next) {
          if (state.subscription?.id === payload.subscription_id) {
            next.set(k, EMPTY_STATE);
          }
        }
        return next;
      });
    };

    const handleTriggered = async (payload: StopAlertTriggeredPayload) => {
      updateAlert(payload.route_id, payload.stop_id, (prev) => ({
        ...prev,
        lastTrigger: payload,
      }));

      // El push se dispara aquí, en el Provider global, sin importar qué
      // página esté abierta en ese momento — a diferencia del enfoque
      // anterior, donde dependía de que un componente de página específica
      // estuviera montado.
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

    // Reconstruye el estado completo de "qué alertas tengo activas" desde
    // el backend (fuente de verdad real), cada vez que el socket conecta
    // o reconecta — cubre tanto el 'connected' inicial (que el backend ya
    // emite junto con la reclamación automática) como una consulta manual.
    const handleListed = (payload: { subscriptions: StopAlertSubscription[] }) => {
      setAlerts((prevMap) => {
        const next = new Map(prevMap);
        for (const sub of payload.subscriptions ?? []) {
          const k = key(sub.route_id, sub.stop_id);
          const prevState = next.get(k) ?? EMPTY_STATE;
          next.set(k, { ...prevState, subscription: sub });
        }
        return next;
      });
    };

    socket.on('stop_alert_confirmed', handleConfirmed);
    socket.on('stop_alert_error', handleErrorEvt);
    socket.on('stop_alert_unsubscribed', handleUnsubscribed);
    socket.on('stop_alert_triggered', handleTriggered);
    socket.on('stop_alerts_listed', handleListed);

    return () => {
      socket.off('stop_alert_confirmed', handleConfirmed);
      socket.off('stop_alert_error', handleErrorEvt);
      socket.off('stop_alert_unsubscribed', handleUnsubscribed);
      socket.off('stop_alert_triggered', handleTriggered);
      socket.off('stop_alerts_listed', handleListed);
    };
  }, [socket, updateAlert]);

  // Al reconectar (recarga de página, pérdida de red, etc.) pedimos
  // explícitamente la lista de alertas — refuerza lo que el backend ya
  // envía automáticamente al conectar, por si ese mensaje se perdiera.
  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('list_stop_alerts');
    }
  }, [socket, isConnected]);

  const activarAlerta = useCallback(
    async (params: { routeId: string; stopId: string; anticipationMin: AnticipacionMin }) => {
      if (!socket || !isConnected) {
        setError('No hay conexión con el servicio de notificaciones. Intenta de nuevo.');
        return;
      }

      setIsSubscribing(true);
      setError(null);

      if (getNotificationPermission() !== 'unsupported') {
        const permiso = await requestNotificationPermission();
        setPermisoNotificaciones(permiso);
      }

      return new Promise<void>((resolve, reject) => {
        pendingResolveRef.current = { resolve, reject };
        socket.emit('subscribe_stop_alert', {
          route_id: params.routeId,
          stop_id: params.stopId,
          anticipation_min: params.anticipationMin,
        });
      });
    },
    [socket, isConnected],
  );

  const desactivarAlerta = useCallback(
    (subscriptionId: string, routeId: string, stopId: string) => {
      if (!socket) return;
      socket.emit('unsubscribe_stop_alert', { subscription_id: subscriptionId });
      // Limpieza optimista local; igual llegará 'stop_alert_unsubscribed'
      // del servidor para confirmar, pero no hace falta esperarlo para
      // que la UI reaccione.
      updateAlert(routeId, stopId, () => EMPTY_STATE);
    },
    [socket, updateAlert],
  );

  return (
    <StopAlertsContext.Provider
      value={{
        alerts,
        permisoNotificaciones,
        activarAlerta,
        desactivarAlerta,
        isSubscribing,
        error,
      }}
    >
      {children}
    </StopAlertsContext.Provider>
  );
};

/** Hook de bajo nivel: acceso directo al contexto completo. */
export const useStopAlertsContext = (): StopAlertsContextValue => {
  const ctx = useContext(StopAlertsContext);
  if (!ctx) throw new Error('useStopAlertsContext debe usarse dentro de StopAlertsProvider');
  return ctx;
};

/**
 * Hook de alto nivel: el estado de UNA alerta específica (ruta+paradero),
 * listo para usar en un componente de página. Reemplaza al antiguo
 * useStopAlerts.
 */
export const useStopAlertState = (
  routeId: string | undefined,
  stopId: string | undefined,
): StopAlertState => {
  const { alerts } = useStopAlertsContext();
  if (!routeId || !stopId) return EMPTY_STATE;
  return alerts.get(key(routeId, stopId)) ?? EMPTY_STATE;
};