// ================================================================
// TIPOS — Módulo Rutas
// Contratos temporales basados en el modelo real.
// Se actualizarán cuando los DTOs del backend estén disponibles.
// ================================================================

export interface Stop {
  id: string;
  codigo: string;
  nombre: string;
  latitud: number;
  longitud: number;
  tipo: string;
  estado: boolean;
}

export interface RouteStop {
  paradero: Stop;
  orden: number;
  distancia_desde_anterior: number; // km
  tiempo_estimado: number;          // minutos
}

export interface Route {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  tarifa: number;
  tiempo_estimado_total: number; // minutos
  estado: boolean;
  paraderos: RouteStop[];
}

// Payload que llega por websocket (ubicación bus activo en la ruta)
export interface ActiveBusLocation {
  bus_id: string;
  placa: string;
  latitud: number;
  longitud: number;
  pasajeros_actuales: number;
  capacidad_total: number;
  timestamp: string;
}

export interface RouteFilters {
  search: string;
  soloActivas: boolean;
}
