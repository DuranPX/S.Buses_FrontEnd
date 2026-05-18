// ================================================================
// TIPOS — Módulo Conductores y Turnos (HU-006)
// ================================================================

export interface DriverShift {
  id: string;
  conductor_id: string;
  bus_id: string;
  fecha_inicio_programada: string;
  fecha_fin_programada: string;
  fecha_inicio_real: string | null;
  fecha_fin_real: string | null;
  estado: 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO';
  observaciones: string;
  // expandidos
  conductor_nombre?: string;
  bus_placa?: string;
}

export interface BusCondition {
  nivel_combustible: number; // 0-100
  presion_llantas: 'OK' | 'Revisar';
  luces: 'OK' | 'Falla';
  frenos: 'OK' | 'Revisar';
  limpieza: 'Buena' | 'Regular' | 'Mala';
  observaciones: string;
}
