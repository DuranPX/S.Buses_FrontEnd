import { useEffect } from 'react';
import { WS_EVENTS } from '../../../websocket/events';
import { isMockSocket, appSocket } from '../../../websocket/socket';

export const MockGPSController = () => {
  const isActive = true;

  useEffect(() => {
    if (!isMockSocket || !isActive) return;

    // Emitir coordenadas falsas cada 3 segundos
    const timer = setInterval(() => {
      // Simular movimiento aleatorio alrededor de Manizales
      const lat = 5.068 + (Math.random() - 0.5) * 0.05;
      const lng = -75.517 + (Math.random() - 0.5) * 0.05;
      
      (appSocket as any).emit(WS_EVENTS.DRIVER_LOCATION_UPDATED, {
        busId: 'b-001',
        lat,
        lng,
        timestamp: Date.now()
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [isActive]);

  return (
    <div style={{ display: 'none' }}></div>
  );
};
