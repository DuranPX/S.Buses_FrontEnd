// ================================================================
// SOCKET SINGLETON — Sistema de Buses
//
// Soporta dos modos:
//  - MOCK MODE (VITE_MOCK_WS=true): no conecta al servidor real.
//    Usa un EventEmitter interno. Los módulos pueden disparar
//    eventos mock con mockSocket.emit(event, data).
//  - REAL MODE: conecta a VITE_WS_URL con socket.io-client.
//
// En ambos modos la API es idéntica para los consumidores.
// ================================================================

import { io, Socket } from 'socket.io-client';

const MOCK_MODE = import.meta.env.VITE_MOCK_WS !== 'false';
const WS_URL = import.meta.env.VITE_WS_URL;

// ---- Mini EventEmitter para mock mode ----
type Listener = (...args: any[]) => void;

class MockSocket {
  private listeners: Map<string, Listener[]> = new Map();

  on(event: string, fn: Listener) {
    const existing = this.listeners.get(event) ?? [];
    this.listeners.set(event, [...existing, fn]);
    return this;
  }

  off(event: string, fn: Listener) {
    const existing = this.listeners.get(event) ?? [];
    this.listeners.set(event, existing.filter(l => l !== fn));
    return this;
  }

  /** Dispara un evento localmente (útil para simular llegada de datos del servidor) */
  emit(event: string, ...args: any[]) {
    const fns = this.listeners.get(event) ?? [];
    fns.forEach(fn => fn(...args));
    return this;
  }
  connect() { return this; }
  disconnect() {
    this.listeners.clear();
  }

  /** Simula conexión — siempre "conectado" en mock */
  connected = true;
  id = 'mock-socket-id';
}

// ---- Instancia única ----
let _socket: Socket | MockSocket;

if (MOCK_MODE) {
  _socket = new MockSocket();
  console.info('[WS] 🟡 Mock mode activo — sin conexión real al servidor');
} else {

  _socket = io(`${WS_URL}/transport`, {
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

  _socket.on('connect', () => {
    console.info(`[WS] 🟢 Conectado al servidor: ${WS_URL}`);
  });

  _socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      console.warn('[WS] 🔴 Desconectado: io server disconnect');
    } else {
      console.warn(`[WS] 🔴 Desconectado: ${reason}`);
    }
  });

  _socket.on('connect_error', (err) => {
    console.error('[WS] Error de conexión:', err.message);
  });
}

export const appSocket = _socket as {
  on: (event: string, fn: (...args: unknown[]) => void) => void;
  off: (event: string, fn: (...args: unknown[]) => void) => void;
  emit: (event: string, ...args: unknown[]) => void;
  connect: () => void;
  disconnect: () => void;
  connected: boolean;
  id: string;
};
export const isMockSocket = MOCK_MODE;
