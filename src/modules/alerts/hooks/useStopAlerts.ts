// src/modules/alerts/hooks/useStopAlerts.ts
//
// Hook delgado para un paradero específico: lee el estado centralizado de
// StopAlertsProvider (montado una sola vez en main.tsx) y expone una API
// cómoda para el componente de UI (StopAlertControls).
//
// Toda la lógica de red, persistencia y disparo de notificaciones vive en
// StopAlertsProvider — este hook NO mantiene su propio estado local, así
// que no hay riesgo de que se desincronice al cambiar de página o recargar.

import { useCallback } from 'react';
import { useStopAlertsContext } from '../../../notifications/StopAlertsProvider';
import type { AlertaActiva, AnticipacionMin, StopAlertTriggeredPayload } from '../types/alert.types';

interface UseStopAlertsOptions {
  rutaNombre?: string;
  paraderoNombre?: string;
}

interface UseStopAlertsReturn {
  alertaActiva: AlertaActiva | null;
  isSubscribing: boolean;
  error: string | null;
  ultimaAlertaDisparada: StopAlertTriggeredPayload | null;
  activarAlerta: (params: {
    routeId: string;
    stopId: string;
    anticipationMin: AnticipacionMin;
  }) => Promise<void>;
  desactivarAlerta: () => void;
}

export const useStopAlerts = (
  routeId: string | undefined,
  stopId: string | undefined,
  options: UseStopAlertsOptions = {},
): UseStopAlertsReturn => {
  const { alerts, subscribe, unsubscribe, lastError } = useStopAlertsContext();

  const state = routeId && stopId ? alerts.get(`${routeId}::${stopId}`) : undefined;

  const alertaActiva: AlertaActiva | null = state
    ? {
        ...state.subscription,
        rutaNombre: options.rutaNombre,
        paraderoNombre: options.paraderoNombre,
      }
    : null;

  const activarAlerta = useCallback(
    async (params: { routeId: string; stopId: string; anticipationMin: AnticipacionMin }) => {
      await subscribe(params);
    },
    [subscribe],
  );

  const desactivarAlerta = useCallback(() => {
    if (!routeId || !stopId) return;
    unsubscribe(routeId, stopId);
  }, [unsubscribe, routeId, stopId]);

  return {
    alertaActiva,
    isSubscribing: false,
    error: lastError,
    ultimaAlertaDisparada: state?.lastTriggered ?? null,
    activarAlerta,
    desactivarAlerta,
  };
};