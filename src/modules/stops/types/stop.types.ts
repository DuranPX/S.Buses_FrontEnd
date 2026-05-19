// ================================================================
// TIPOS — Módulo Paraderos (HU-002)
// ================================================================

export interface Stop {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  latitud: number;
  longitud: number;
  estado: boolean;

  rutaParaderos?: {
    ruta: {
      id: string;
      nombre: string;
    };
  }[];
}

export interface NearbyStop extends Stop {
  distancia: number; // Distancia en metros desde la ubicación actual
  rutas: string[];   // Nombres o códigos de las rutas que pasan por aquí
}

export interface Coordinates {
  lat: number;
  lng: number;
}
