// ================================================================
// WEBSOCKET EVENTS — Sistema de Buses
// Todos los eventos que se usarán en producción con el backend real.
// En mock mode estos eventos son emitidos por timers internos.
// ================================================================

export const WS_EVENTS = {
  // --- Rutas ---
  ROUTE_BUS_LOCATION_UPDATED: 'route_bus_location_updated',
  ROUTE_DELAY_UPDATED: 'route_delay_updated',
  ROUTE_CAPACITY_UPDATED: 'route_capacity_updated',

  // --- Paraderos cercanos ---
  NEARBY_BUS_UPDATED: 'nearby_bus_updated',
  STOP_CAPACITY_UPDATED: 'stop_capacity_updated',
  STOP_ARRIVAL_ESTIMATION: 'stop_arrival_estimation',

  // --- Boletos / Abordaje ---
  TICKET_VALIDATED: 'ticket_validated',
  PASSENGER_BOARDED: 'passenger_boarded',
  BUS_CAPACITY_UPDATED: 'bus_capacity_updated',

  // --- Finalización de viaje ---
  PASSENGER_DESCENDED: 'passenger_descended',
  TRIP_COMPLETED: 'trip_completed',

  // --- Historial de viajes ---
  TRIP_UPDATED: 'trip_updated',
  ACTIVE_TRIP_STATUS: 'active_trip_status',

  // --- Conductores / Turnos ---
  SHIFT_STARTED: 'shift_started',
  DRIVER_LOCATION_UPDATED: 'driver_location_updated',
  BUS_LOCATION_UPDATED: 'bus_location_updated',

  // --- Incidentes ---
  INCIDENT_CREATED: 'incident_created',
  INCIDENT_UPDATED: 'incident_updated',
  CRITICAL_INCIDENT_ALERT: 'critical_incident_alert',

  // --- Programaciones ---
  SCHEDULE_CREATED: 'schedule_created',
  BUS_SCHEDULE_UPDATED: 'bus_schedule_updated',

  // --- Estado de bus ---
  BUS_STATUS_UPDATED: 'bus_status_updated',
  BUS_CONNECTED: 'bus_connected',

  // --- Recargas / Pagos ---
  RECHARGE_COMPLETED: 'recharge_completed',
  PAYMENT_STATUS_UPDATED: 'payment_status_updated',

  // --- Analíticas ---
  ANALYTICS_INCOME_UPDATED: 'analytics_income_updated',
  ANALYTICS_AGE_UPDATED: 'analytics_age_updated',
  ANALYTICS_INCIDENTS_UPDATED: 'analytics_incidents_updated',
} as const;

export type WsEvent = typeof WS_EVENTS[keyof typeof WS_EVENTS];
