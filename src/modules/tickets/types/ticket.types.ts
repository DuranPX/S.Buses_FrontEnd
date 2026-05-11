// ================================================================
// TIPOS — Módulo Boletos (HU-003)
// ================================================================

export interface Ticket {
  id: string;
  ciudadano_id: string;
  metodo_pago_id: string;
  ruta_id: string;
  paradero_origen_id: string;
  paradero_destino_id: string | null; // Se llena al finalizar el viaje
  tarifa_pagada: number;
  estado: 'Activo' | 'Completado' | 'Cancelado';
  fecha_emision: string;
  qr_code: string;
  
  // Datos expandidos para la UI
  ruta_codigo?: string;
  ruta_nombre?: string;
  origen_nombre?: string;
  destino_nombre?: string;
}
