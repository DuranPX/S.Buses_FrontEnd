// ================================================================
// SOCKET SINGLETON — Sistema de Buses
//
// Soporta dos modos:
//  - MOCK MODE (VITE_MOCK_WS=true): sin conexión real.
//  - REAL MODE: dos servidores WS independientes.
//      · VITE_WS_URL          → ms-notifications (tu servicio, root)
//      · VITE_WS_TRANSPORT_URL → ms-transport de tu compañero (/transport)
// ================================================================

import { io, Socket } from 'socket.io-client';

const MOCK_MODE        = import.meta.env.VITE_MOCK_WS !== 'false';
const WS_URL           = import.meta.env.VITE_WS_URL;
const WS_TRANSPORT_URL = import.meta.env.VITE_WS_TRANSPORT_URL;

// ── Tipos ────────────────────────────────────────────────────────
type Listener = (...args: any[]) => void;

export type AppSocket = {
  on:         (event: string, fn: (...args: any[]) => void) => void;
  off:        (event: string, fn?: (...args: any[]) => void) => void;
  emit:       (event: string, ...args: any[]) => void;
  connect:    () => void;
  disconnect: () => void;
  connected:  boolean;
  id:         string;
};

// ── Mock Socket ──────────────────────────────────────────────────
class MockSocket {
  private listeners: Map<string, Listener[]> = new Map();
  connected = true;
  id = 'mock-socket-id';

  on(event: string, fn: Listener) {
    const existing = this.listeners.get(event) ?? [];
    this.listeners.set(event, [...existing, fn]);
    return this;
  }

  off(event: string, fn?: Listener) {
    if (!fn) {
      this.listeners.delete(event);
      return this;
    }
    const existing = this.listeners.get(event) ?? [];
    this.listeners.set(event, existing.filter((l) => l !== fn));
    return this;
  }

  emit(event: string, ...args: any[]) {
    (this.listeners.get(event) ?? []).forEach((fn) => fn(...args));
    return this;
  }

  connect()    { return this; }
  disconnect() { this.listeners.clear(); }
}

// ── Factory ──────────────────────────────────────────────────────
function createRealSocket(url: string, label: string): Socket {
  const socket = io(url, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    transports: ['websocket'],
    auth: (cb) => {
      const token = localStorage.getItem('token');
      cb({ token: `Bearer ${token}` });
    },
  });

  socket.on('connect',       ()    => console.info(`[WS:${label}] 🟢 Conectado: ${url}`));
  socket.on('disconnect',    (r)   => console.warn(`[WS:${label}] 🔴 Desconectado: ${r}`));
  socket.on('connect_error', (err) => console.error(`[WS:${label}] Error:`, err.message));

  return socket;
}

function buildSocket(url: string, label: string): AppSocket {
  if (MOCK_MODE) {
    console.info(`[WS:${label}] 🟡 Mock mode activo`);
    return new MockSocket() as unknown as AppSocket;
  }
  return createRealSocket(url, label) as unknown as AppSocket;
}

// ── Instancias ───────────────────────────────────────────────────

/** ms-notifications (puerto 5002) — tracking GPS, alertas, paraderos, mensajes */
export const notificationsSocket = buildSocket(WS_URL, 'notifications');

/** ms-transport de tu compañero (/transport) */
export const appSocket = buildSocket(
  `${WS_TRANSPORT_URL}/transport`,
  'transport',
);

export const isMockSocket = MOCK_MODE;