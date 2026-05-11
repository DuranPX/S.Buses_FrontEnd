// ================================================================
// TIPOS — Módulo Paraderos (HU-002)
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

export interface NearbyStop extends Stop {
  distancia: number; // Distancia en km desde la ubicación actual
  rutas: string[];   // Nombres o códigos de las rutas que pasan por aquí
}

export interface Coordinates {
  lat: number;
  lng: number;
}
