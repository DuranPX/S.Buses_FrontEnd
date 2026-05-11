// ================================================================
// MOCK DATA — BOLETOS + TURNOS + PROGRAMACIONES
// Basado en: BOLETO, TURNO, PROGRAMACION, METODO_PAGO
// ================================================================

export interface MockMetodoPago {
  id: string;
  tipo: 'Tarjeta' | 'Efectivo' | 'ePayco';
  descripcion: string;
}

export interface MockBoleto {
  id: string;
  ciudadano_id: string;
  programacion_id: string;
  metodo_pago_id: string;
  paradero_abordaje_id: string;
  paradero_descenso_id: string;
  hora_abordaje: string;    // ISO string
  hora_descenso: string | null;
  estado: 'Activo' | 'Completado' | 'Cancelado';
  monto_pagado: number;
  qr_validacion: string;
  // campos expandidos para UI
  ruta_nombre?: string;
  bus_placa?: string;
  conductor_nombre?: string;
  paradero_abordaje_nombre?: string;
  paradero_descenso_nombre?: string;
}

export interface MockProgramacion {
  id: string;
  ruta_id: string;
  bus_id: string;
  fecha: string;
  hora_salida: string;
  tolerancia_minutos: number;
  pasajeros_actuales: number;
  tipo_recurrencia: 'Diaria' | 'Laboral' | 'Fin_Semana';
  estado: 'Programado' | 'En_Curso' | 'Finalizado';
  // expandidos para UI
  ruta_nombre?: string;
  bus_placa?: string;
}

export interface MockTurno {
  id: string;
  conductor_id: string;
  bus_id: string;
  fecha_inicio_programada: string;
  fecha_fin_programada: string;
  fecha_inicio_real: string | null;
  fecha_fin_real: string | null;
  estado: 'Programado' | 'En_Curso' | 'Finalizado';
  observaciones: string;
  // expandidos
  conductor_nombre?: string;
  bus_placa?: string;
}

export const MOCK_METODOS_PAGO: MockMetodoPago[] = [
  { id: 'mp-001', tipo: 'Tarjeta',  descripcion: 'Tarjeta recargable del sistema' },
  { id: 'mp-002', tipo: 'Efectivo', descripcion: 'Pago en efectivo al conductor'  },
  { id: 'mp-003', tipo: 'ePayco',   descripcion: 'Pasarela de pagos ePayco'       },
];

export const MOCK_PROGRAMACIONES: MockProgramacion[] = [
  { id: 'prog-001', ruta_id: 'r-001', bus_id: 'b-001', fecha: '2026-05-08', hora_salida: '06:00', tolerancia_minutos: 5,  pasajeros_actuales: 12, tipo_recurrencia: 'Diaria',    estado: 'En_Curso',   ruta_nombre: 'Terminal - La Enea',        bus_placa: 'ABC-123' },
  { id: 'prog-002', ruta_id: 'r-002', bus_id: 'b-002', fecha: '2026-05-08', hora_salida: '06:30', tolerancia_minutos: 5,  pasajeros_actuales: 8,  tipo_recurrencia: 'Laboral',   estado: 'Programado', ruta_nombre: 'Chipre - San Marcel',       bus_placa: 'DEF-456' },
  { id: 'prog-003', ruta_id: 'r-003', bus_id: 'b-004', fecha: '2026-05-08', hora_salida: '07:00', tolerancia_minutos: 10, pasajeros_actuales: 0,  tipo_recurrencia: 'Diaria',    estado: 'Programado', ruta_nombre: 'Cable - Estadio Circular',  bus_placa: 'JKL-012' },
  { id: 'prog-004', ruta_id: 'r-001', bus_id: 'b-006', fecha: '2026-05-08', hora_salida: '07:30', tolerancia_minutos: 5,  pasajeros_actuales: 0,  tipo_recurrencia: 'Diaria',    estado: 'Programado', ruta_nombre: 'Terminal - La Enea',        bus_placa: 'PQR-678' },
  { id: 'prog-005', ruta_id: 'r-004', bus_id: 'b-001', fecha: '2026-05-07', hora_salida: '18:00', tolerancia_minutos: 5,  pasajeros_actuales: 43, tipo_recurrencia: 'Fin_Semana',estado: 'Finalizado', ruta_nombre: 'Terminal - Versalles Expreso', bus_placa: 'ABC-123' },
];

export const MOCK_TURNOS: MockTurno[] = [
  { id: 't-001', conductor_id: 'c-001', bus_id: 'b-001', fecha_inicio_programada: '2026-05-08T05:45:00Z', fecha_fin_programada: '2026-05-08T14:00:00Z', fecha_inicio_real: '2026-05-08T05:47:00Z', fecha_fin_real: null,                    estado: 'En_Curso',   observaciones: 'Sin novedades', conductor_nombre: 'Carlos Ramírez',   bus_placa: 'ABC-123' },
  { id: 't-002', conductor_id: 'c-002', bus_id: 'b-002', fecha_inicio_programada: '2026-05-08T06:00:00Z', fecha_fin_programada: '2026-05-08T14:15:00Z', fecha_inicio_real: '2026-05-08T06:02:00Z', fecha_fin_real: null,                    estado: 'En_Curso',   observaciones: '',               conductor_nombre: 'Alejandro Torres', bus_placa: 'DEF-456' },
  { id: 't-003', conductor_id: 'c-003', bus_id: 'b-004', fecha_inicio_programada: '2026-05-08T06:45:00Z', fecha_fin_programada: '2026-05-08T15:00:00Z', fecha_inicio_real: null,                    fecha_fin_real: null,                    estado: 'Programado', observaciones: '',               conductor_nombre: 'Luisa González',  bus_placa: 'JKL-012' },
  { id: 't-004', conductor_id: 'c-001', bus_id: 'b-001', fecha_inicio_programada: '2026-05-07T14:00:00Z', fecha_fin_programada: '2026-05-07T22:00:00Z', fecha_inicio_real: '2026-05-07T14:03:00Z', fecha_fin_real: '2026-05-07T22:05:00Z', estado: 'Finalizado', observaciones: 'Leve retraso por lluvia', conductor_nombre: 'Carlos Ramírez', bus_placa: 'ABC-123' },
];

export const MOCK_BOLETOS: MockBoleto[] = [
  { id: 'bol-001', ciudadano_id: 'u-001', programacion_id: 'prog-001', metodo_pago_id: 'mp-001', paradero_abordaje_id: 'p-001', paradero_descenso_id: 'p-004', hora_abordaje: '2026-05-08T06:05:00Z', hora_descenso: '2026-05-08T06:38:00Z', estado: 'Completado', monto_pagado: 2800, qr_validacion: 'QR-BOL001', ruta_nombre: 'Terminal - La Enea',  bus_placa: 'ABC-123', conductor_nombre: 'Carlos Ramírez',   paradero_abordaje_nombre: 'Terminal Central', paradero_descenso_nombre: 'La Enea' },
  { id: 'bol-002', ciudadano_id: 'u-001', programacion_id: 'prog-005', metodo_pago_id: 'mp-001', paradero_abordaje_id: 'p-001', paradero_descenso_id: 'p-010', hora_abordaje: '2026-05-07T18:04:00Z', hora_descenso: '2026-05-07T18:26:00Z', estado: 'Completado', monto_pagado: 3200, qr_validacion: 'QR-BOL002', ruta_nombre: 'Terminal - Versalles Expreso', bus_placa: 'ABC-123', conductor_nombre: 'Carlos Ramírez', paradero_abordaje_nombre: 'Terminal Central', paradero_descenso_nombre: 'Versalles' },
  { id: 'bol-003', ciudadano_id: 'u-001', programacion_id: 'prog-001', metodo_pago_id: 'mp-001', paradero_abordaje_id: 'p-002', paradero_descenso_id: 'p-003', hora_abordaje: '2026-05-08T10:15:00Z', hora_descenso: null,                    estado: 'Activo',     monto_pagado: 2800, qr_validacion: 'QR-BOL003', ruta_nombre: 'Terminal - La Enea',  bus_placa: 'ABC-123', conductor_nombre: 'Carlos Ramírez',   paradero_abordaje_nombre: 'Parque Caldas',    paradero_descenso_nombre: 'Estadio Palogrande' },
];
