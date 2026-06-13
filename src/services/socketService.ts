import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private url: string;
  private isConnecting: boolean = false;

  constructor() {
    // Apuntamos al microservicio ms-notifications
    this.url = import.meta.env.VITE_MS_NOTIFICATIONS_URL || 'http://localhost:5002';
  }

  /**
   * Conecta el socket enviando el token JWT.
   * Patrón Singleton: solo inicializa si no existe o está desconectado.
   */
  public connect(token: string): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (this.isConnecting) {
      return this.socket!;
    }

    this.isConnecting = true;

    this.socket = io(this.url, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Conectado a ms-notifications');
      this.isConnecting = false;
    });

    this.socket.on('connect_error', (err) => {
      console.error('❌ Error de conexión en socket:', err.message);
      this.isConnecting = false;
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`🔌 Desconectado: ${reason}`);
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
