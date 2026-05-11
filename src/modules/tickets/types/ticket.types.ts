// ================================================================
// TIPOS — Módulo Boletos
// Mapeados 1-a-1 con el BoletoEntity del backend (ms-business)
// ================================================================

// ── Enums (tal como los devuelve el backend en MAYÚSCULAS) ────────
export type EstadoBoleto = 'ACTIVO' | 'COMPLETADO' | 'CANCELADO';

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
  hora_salida?: string;
  tarifa?: number;
  capacidad_maxima?: number;
  pasajeros_actuales?: number;
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
}

// ── Respuesta RAW del backend (/boletos, /boletos/:id) ────────────
export interface BoletoRaw {
  id: string;
  estado: EstadoBoleto;
  monto_pagado: number;
  tarifa_pagada?: number;
  fecha_emision?: string;   // ISO 8601; puede venir como createdAt dependiendo de la entidad
  createdAt?: string;
  qr_code?: string;
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
  tarifa_pagada: number;

  // Fechas
  fecha_emision: string;        // ISO 8601, siempre presente tras normalizar

  // Código QR para abordaje
  qr_code: string;

  // IDs de relaciones (útiles para llamadas posteriores)
  ciudadano_id?: string;
  programacion_id?: string;
  metodo_pago_id?: string;

  // Datos expandidos para la UI (opcionales, vienen de las relaciones)
  ruta_codigo?: string;         // programacion.ruta.codigo
  ruta_nombre?: string;         // programacion.ruta.nombre
  origen_nombre?: string;       // paraderoAbordaje.nombre
  destino_nombre?: string;      // paraderoDescenso.nombre  (null si viaje en curso)
  saldo_restante?: number;      // sólo se conoce justo después de comprar
}

// ── DTO que espera POST /boletos/comprar ──────────────────────────
export interface CreateBoletoDto {
  ciudadano_id: string;
  programacion_id: string;
  metodo_pago_id: string;
  paradero_abordaje_id: string;
  paradero_descenso_id?: string;
  monto_pagado: number;
  tarifa_pagada: number;
}