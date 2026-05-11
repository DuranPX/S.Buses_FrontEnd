import { useState, useEffect } from 'react';
import { WS_EVENTS } from '../../../websocket/events';
import { isMockSocket, appSocket } from '../../../websocket/socket';

export const MockGPSController = () => {
  const [isActive, setIsActive] = useState(false);

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
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1rem', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h4 style={{ margin: '0 0 0.25rem', color: '#f8fafc', fontSize: '0.9rem' }}>Simulador GPS (Mock)</h4>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
          Emite coordenadas falsas por WebSockets para pruebas.
        </p>
      </div>
      <button 
        onClick={() => setIsActive(!isActive)}
        style={{ 
          background: isActive ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
          color: isActive ? '#ef4444' : '#10b981',
          border: `1px solid ${isActive ? '#ef4444' : '#10b981'}`,
          padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer',
          fontWeight: 600, fontSize: '0.8rem'
        }}
      >
        {isActive ? 'Detener GPS' : 'Iniciar GPS'}
      </button>
    </div>
  );
};
