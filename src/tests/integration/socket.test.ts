

/*import { socketService } from '../../services/socketService';
import { io } from 'socket.io-client';


// Mock de socket.io-client
jest.mock('socket.io-client', () => {
  const mSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
  };
  return {
    io: jest.fn(() => mSocket),
  };
});

describe('SocketService', () => {
  afterEach(() => {
    jest.clearAllMocks();
    socketService.disconnect();
  });

  it('debe inicializar la conexión enviando el token', () => {
    const fakeToken = 'fake-jwt-token';
    const socket = socketService.connect(fakeToken);

    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        auth: { token: fakeToken },
        reconnection: true,
      })
    );
    expect(socket).not.toBeNull();
  });

  it('debe retornar la misma instancia si ya está conectando/conectado (Singleton)', () => {
    const socket1 = socketService.connect('token1');
    const socket2 = socketService.connect('token2');

    expect(io).toHaveBeenCalledTimes(1); // Solo se llama la primera vez
    expect(socket1).toBe(socket2);
  });
});
*/