//src/modules/routes/hooks/useRouteSocket.ts

import { useMemo } from 'react';
import { useGPSPositions } from '../../../websocket/hooks/useGPSPositions';
import { NivelRetraso } from '../../../types/bus-tracking.types';
import type { BusPosicion } from '../../../types/bus-tracking.types';

interface UseRouteSocketReturn {
  activeBuses: BusPosicion[];
  hasDelay: boolean;
  conectado: boolean;
  ultimaSincronizacion: string | null;
}

export const useRouteSocket = (routeId: string | undefined): UseRouteSocketReturn => {
  const { buses, conectado, ultimaSincronizacion } = useGPSPositions(routeId ?? '');

  const activeBuses = useMemo(() => Array.from(buses.values()), [buses]);

  const hasDelay = useMemo(() =>
    activeBuses.some(b =>
      b.nivelRetraso === NivelRetraso.Critico ||
      b.nivelRetraso === NivelRetraso.Moderado
    ),
    [activeBuses]
  );

  return { activeBuses, hasDelay, conectado, ultimaSincronizacion };
};