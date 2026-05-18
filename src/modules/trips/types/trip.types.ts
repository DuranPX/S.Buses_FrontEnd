// ================================================================
// TIPOS — Módulo Viajes (HU-004, HU-005)
// Representan boletos completados (viajes)
// ================================================================

export interface TripParadero {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
}

export interface TripConductor {
  id: string;
  nombre: string;
  licencia: string;
}

export interface TripBus {
  id: string;
  placa: string;
  modelo: string;
}
export interface Trip {
  id: string; // ID del boleto
  ruta_codigo: string;
  ruta_nombre: string;
  origen_nombre: string;
  destino_nombre: string;
  tarifa_pagada: number;
  fecha_abordaje: string;
  fecha_descenso: string;
  duracion_minutos: number;
  distancia_km?: number;
  paraderoAbordaje?: TripParadero;
  paraderoDescenso?: TripParadero;
  bus?: TripBus;
  conductor?: TripConductor;
}