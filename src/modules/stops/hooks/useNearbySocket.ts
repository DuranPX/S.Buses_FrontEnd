import { useState, useCallback, useEffect } from 'react';
import { useSocket } from '../../../websocket/hooks/useSocket';
import { WS_EVENTS } from '../../../websocket/events';
import { isMockSocket, appSocket } from '../../../websocket/socket';

export interface NearbyBus {
  id: string;
  ruta_codigo: string;
  tiempo_llegada: number; // minutos
  ocupacion_pct: number;
}

export const useNearbySocket = (stopId: string | null) => {
  const [arrivingBuses, setArrivingBuses] = useState<NearbyBus[]>([]);

  const handleArrivals = useCallback((data: NearbyBus[]) => {
    setArrivingBuses(data);
  }, []);

  useSocket<NearbyBus[]>(WS_EVENTS.NEARBY_BUS_UPDATED, handleArrivals);

  // Mock: Simula la llegada de buses cercanos aleatorios
  useEffect(() => {
    if (!isMockSocket || !stopId) return;

    // Estado inicial aleatorio
    let currentBuses: NearbyBus[] = [
      { id: 'b1', ruta_codigo: 'R-01', tiempo_llegada: 3, ocupacion_pct: 45 },
      { id: 'b2', ruta_codigo: 'R-02', tiempo_llegada: 8, ocupacion_pct: 85 },
      { id: 'b3', ruta_codigo: 'R-03', tiempo_llegada: 12, ocupacion_pct: 20 },
    ];
    setArrivingBuses(currentBuses);

    const timer = setInterval(() => {
      currentBuses = currentBuses.map(b => ({
        ...b,
        tiempo_llegada: Math.max(0, b.tiempo_llegada - 1),
        ocupacion_pct: Math.min(100, Math.max(0, b.ocupacion_pct + (Math.floor(Math.random() * 11) - 5)))
      })).filter(b => b.tiempo_llegada > 0);

      // A veces añadir un bus nuevo
      if (Math.random() > 0.7 && currentBuses.length < 4) {
        currentBuses.push({
          id: `b${Date.now()}`,
          ruta_codigo: `R-0${Math.floor(Math.random() * 5) + 1}`,
          tiempo_llegada: 15,
          ocupacion_pct: Math.floor(Math.random() * 100)
        });
      }

      (appSocket as any).emit(WS_EVENTS.NEARBY_BUS_UPDATED, currentBuses);
    }, 5000);

    return () => clearInterval(timer);
  }, [stopId]);

  return { arrivingBuses };
};
