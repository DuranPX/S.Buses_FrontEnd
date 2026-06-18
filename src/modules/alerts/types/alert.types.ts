// ================================================================
// TIPOS — Módulo Alertas de Paradero ("Aviso de bus a X minutos")
// ================================================================

/** Anticipaciones permitidas por el contrato de ms-notifications. */
export const ANTICIPACIONES_MIN = [5, 10, 15] as const;
export type AnticipacionMin = typeof ANTICIPACIONES_MIN[number];

/** Payload enviado al backend al activar una alerta (evento 'subscribe_stop_alert'). */
export interface SubscribeStopAlertPayload {
  route_id: string;
  stop_id: string;
  anticipation_min: AnticipacionMin;
}

/** Suscripción tal como la devuelve el backend ('stop_alert_confirmed'). */
export interface StopAlertSubscription {
  id: string;
  sid: string;
  user_id: string | null;
  route_id: string;
  stop_id: string;
  anticipation_min: AnticipacionMin;
  triggered: boolean;
}

/** Payload del evento 'stop_alert_triggered' (la alerta ya se disparó). */
export interface StopAlertTriggeredPayload {
  subscription_id: string;
  route_id: string;
  stop_id: string;
  bus_id?: string;
  placa?: string;
  eta_min: number;
  anticipation_min: AnticipacionMin;
  title: string;
  body: string;
}

/** Payload de error ('stop_alert_error'). */
export interface StopAlertErrorPayload {
  message: string;
}

/** Estado local de una alerta activa, enriquecido con nombres legibles para la UI. */
export interface AlertaActiva extends StopAlertSubscription {
  rutaNombre?: string;
  paraderoNombre?: string;
}