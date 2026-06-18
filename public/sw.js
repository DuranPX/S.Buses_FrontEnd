// public/sw.js
//
// Service Worker mínimo para soportar notificaciones push del navegador en
// la funcionalidad "Aviso de bus a X minutos" (alertas de paradero).
//
// No usamos un push real desde servidor (Web Push con VAPID) porque la
// notificación se dispara mientras la app está abierta y conectada por
// WebSocket: el cliente recibe el evento 'stop_alert_triggered' por socket
// y pide al Service Worker que muestre la notificación del sistema vía
// self.registration.showNotification(...). Esto sí pasa por el SO/navegador
// (no es un simple toast in-page) y soporta acciones rápidas, incluso si la
// pestaña está en segundo plano.
//
// Si en el futuro se quiere notificar con la app totalmente cerrada, este
// es el lugar donde agregar un listener 'push' real con una suscripción
// Web Push (VAPID) gestionada desde el backend.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Mensaje recibido desde la app (ver notifications/pushNotifications.ts):
// { type: 'SHOW_STOP_ALERT', title, body, data: { subscriptionId, routeId, stopId, ... } }
self.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || message.type !== 'SHOW_STOP_ALERT') return;

  const { title, body, data } = message;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: data?.subscriptionId ? `stop-alert-${data.subscriptionId}` : 'stop-alert',
      data,
      requireInteraction: false,
      actions: [
        { action: 'prepare-payment', title: '💳 Preparar pago' },
        { action: 'dismiss', title: 'Cerrar' },
      ],
    }),
  );
});

// Acción rápida: "Preparar método de pago" navega (o enfoca una pestaña
// existente y navega) directamente a /cartera/pago.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = '/cartera/recarga';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => 'focus' in c);

      if (existing) {
        existing.postMessage({ type: 'NAVIGATE', url: targetUrl });
        return existing.focus();
      }

      return self.clients.openWindow(targetUrl);
    }),
  );
});