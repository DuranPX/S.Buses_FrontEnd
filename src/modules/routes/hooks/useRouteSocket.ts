import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../../../websocket/hooks/useSocket';
import { WS_EVENTS } from '../../../websocket/events';
import { appSocket, isMockSocket } from '../../../websocket/socket';
import type { ActiveBusLocation } from '../types/route.types';

// Posiciones mock de buses que simulan movimiento en la ruta
const MOCK_BUS_POSITIONS: ActiveBusLocation[] = [
  { bus_id: 'b-001', placa: 'ABC-123', latitud: 5.0703, longitud: -75.5138, pasajeros_actuales: 18, capacidad_total: 50, timestamp: new Date().toISOString() },
  { bus_id: 'b-002', placa: 'DEF-456', latitud: 5.0756, longitud: -75.5285, pasajeros_actuales: 32, capacidad_total: 45, timestamp: new Date().toISOString() },
];

export const useRouteSocket = (routeId: string | undefined) => {
  const [activeBuses, setActiveBuses] = useState<ActiveBusLocation[]>([]);
  const [hasDelay, setHasDelay] = useState(false);
  const mockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleBusLocation = useCallback((data: ActiveBusLocation) => {
    setActiveBuses(prev => {
      const idx = prev.findIndex(b => b.bus_id === data.bus_id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = data;
        return updated;
      }
      return [...prev, data];
    });
  }, []);

  const handleDelay = useCallback(() => { setHasDelay(true); }, []);

  useSocket<ActiveBusLocation>(WS_EVENTS.ROUTE_BUS_LOCATION_UPDATED, handleBusLocation);
  useSocket(WS_EVENTS.ROUTE_DELAY_UPDATED, handleDelay);

  // Mock: simula buses moviéndose cada 4 segundos
  useEffect(() => {
    if (!isMockSocket || !routeId) return;

    setActiveBuses(MOCK_BUS_POSITIONS);

    mockTimerRef.current = setInterval(() => {
      const updated = MOCK_BUS_POSITIONS.map(b => ({
        ...b,
        latitud:  b.latitud  + (Math.random() - 0.5) * 0.001,
        longitud: b.longitud + (Math.random() - 0.5) * 0.001,
        pasajeros_actuales: Math.min(b.capacidad_total, b.pasajeros_actuales + Math.floor(Math.random() * 3) - 1),
        timestamp: new Date().toISOString(),
      }));
      updated.forEach(b => (appSocket as any).emit(WS_EVENTS.ROUTE_BUS_LOCATION_UPDATED, b));
    }, 4000);

    return () => {
      if (mockTimerRef.current) clearInterval(mockTimerRef.current);
    };
  }, [routeId]);

  return { activeBuses, hasDelay };
};
