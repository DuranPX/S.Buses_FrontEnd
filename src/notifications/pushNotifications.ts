// src/notifications/pushNotifications.ts
//
// Capa fina sobre la Web Notifications API + Service Worker para mostrar
// notificaciones push reales del navegador (no solo un toast in-app) cuando
// llega un evento 'stop_alert_triggered' por WebSocket.
//
// Flujo:
//   1. registerServiceWorker() — se llama una vez al montar la app.
//   2. requestNotificationPermission() — se llama cuando el ciudadano activa
//      su primera alerta (gesto explícito del usuario, requerido por la
//      mayoría de navegadores para no bloquear el prompt de permiso).
//   3. showStopAlertNotification(payload) — se llama al recibir el evento
//      del socket. Si hay Service Worker activo y permiso concedido, manda
//      la notificación al SO. Si no, devuelve `false` para que el caller
//      pueda hacer fallback a un banner/toast in-app.

export interface StopAlertNotificationData {
  subscriptionId: string;
  routeId: string;
  stopId: string;
  busId?: string;
  placa?: string;
  etaMin?: number;
}

let swRegistration: ServiceWorkerRegistration | null = null;

export const isPushSupported = (): boolean =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'Notification' in window;

/**
 * Registra el Service Worker (public/sw.js). Seguro de llamar múltiples
 * veces: el navegador deduplica registros para la misma URL/scope.
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isPushSupported()) return null;

  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js');
    return swRegistration;
  } catch (err) {
    console.warn('[push] No se pudo registrar el Service Worker:', err);
    return null;
  }
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
};

/**
 * Pide permiso de notificaciones al navegador. Debe llamarse a partir de
 * una interacción directa del usuario (click en "Activar alerta"), o varios
 * navegadores ignoran/bloquean el prompt.
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof Notification === 'undefined') return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;

  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
};

/**
 * Muestra la notificación push de "tu bus está cerca". Devuelve true si se
 * logró mostrar vía Service Worker/Notification API; false si no hay
 * soporte o permiso, para que el caller use un fallback in-app.
 */
export const showStopAlertNotification = async (params: {
  title: string;
  body: string;
  data: StopAlertNotificationData;
}): Promise<boolean> => {
  if (!isPushSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  const registration = swRegistration ?? (await navigator.serviceWorker.getRegistration());

  if (registration?.active) {
    registration.active.postMessage({
      type: 'SHOW_STOP_ALERT',
      title: params.title,
      body: params.body,
      data: params.data,
    });
    return true;
  }

  // Fallback sin Service Worker activo: notificación "simple" del navegador.
  // No soporta acciones rápidas, pero sigue siendo una notificación nativa.
  try {
    const notification = new Notification(params.title, {
      body: params.body,
      icon: '/vite.svg',
      tag: `stop-alert-${params.data.subscriptionId}`,
    });
    notification.onclick = () => {
      window.focus();
      window.location.href = '/cartera/recarga';
    };
    return true;
  } catch {
    return false;
  }
};

/**
 * Escucha mensajes 'NAVIGATE' enviados por el Service Worker cuando el
 * ciudadano pulsa la acción rápida "Preparar pago" desde la notificación
 * con la app en segundo plano (pestaña ya abierta).
 */
export const listenForServiceWorkerNavigation = (
  onNavigate: (url: string) => void,
): (() => void) => {
  if (!isPushSupported()) return () => {};

  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'NAVIGATE' && typeof event.data.url === 'string') {
      onNavigate(event.data.url);
    }
  };

  navigator.serviceWorker.addEventListener('message', handler);
  return () => navigator.serviceWorker.removeEventListener('message', handler);
};