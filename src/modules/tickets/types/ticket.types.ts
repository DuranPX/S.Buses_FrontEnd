// ================================================================
// TIPOS — Módulo Boletos
// Mapeados 1-a-1 con el BoletoEntity del backend (ms-business)
// ================================================================

// ── Enums (tal como los devuelve el backend en MAYÚSCULAS) ────────
export type EstadoBoleto = 'Activo' | 'Completado' | 'Cancelado';

// ── Shapes de relaciones anidadas (lo que devuelve findAll/findOne) ─
export interface BoletoCiudadano {
  id: string;
  nombre?: string;
  email?: string;
}

export interface BoletoRuta {
  id: string;
  codigo: string;
  nombre?: string;
}

export interface BoletoProgramacion {
  id: string;
  ruta?: BoletoRuta;
  bus?: { id: string; placa?: string };
  fecha?: string;
  hora_salida: string;
  tolerancia_minutos?: number;
  tarifa?: number;
  capacidad_maxima?: number;
  pasajeros_actuales: number;
  tipo_recurrencia?: string;
  estado: string; // 'En_Curso', etc.
}

export interface BoletoMetodoPago {
  id: string;
  tipo?: string;          // PREPAGO | EFECTIVO | etc.
  nombre?: string;
  saldo?: number;
}

export interface BoletoParadero {
  id: string;
  nombre: string;
  codigo?: string;
  latitud?: string;
  longitud?: string;
  tipo?: string;
  estado?: boolean;
}

// ── Respuesta RAW del backend (/boletos, /boletos/:id) ────────────
export interface BoletoRaw {
  id: string;
  estado: EstadoBoleto;
  monto_pagado: string | number;
  tarifa_pagada?: number;
  fecha_emision?: string;
  createdAt?: string;
  qr_validacion: string; // JSON dice qr_validacion
  hora_abordaje: string;
  hora_descenso: string | null;
  ciudadano?: BoletoCiudadano;
  programacion?: BoletoProgramacion;
  metodoPagoCiudadano?: BoletoMetodoPago;
  paraderoAbordaje?: BoletoParadero;
  paraderoDescenso?: BoletoParadero | null;
}

// ── Tipo normalizado para la UI ───────────────────────────────────
// Aplana las relaciones para que los componentes no conozcan la forma del backend.
export interface Ticket {
  id: string;
  estado: EstadoBoleto;

  // Economía
  monto_pagado: number;

  // Fechas y Tiempos
  fecha_emision: string;
  hora_abordaje: string;
  hora_descenso: string | null;

  // Código QR para abordaje
  qr_code: string;

  // IDs de relaciones
  ciudadano_id?: string;
  programacion_id?: string;
  metodo_pago_id?: string;

  // Datos expandidos para la UI
  ruta_codigo?: string;
  ruta_nombre?: string;
  origen_nombre?: string;
  destino_nombre?: string;
  saldo_restante?: number;

  // Programación Info
  programacion_estado?: string;
  tolerancia_minutos?: number;
}

// ── DTO que espera POST /boletos/comprar ──────────────────────────
export interface CreateBoletoDto {
  programacionId: string;
  metodoPagoId: string;
  paraderoId: string;
}

export interface RegistrarDescensoDto {
  paraderoDescensoId: string;
}