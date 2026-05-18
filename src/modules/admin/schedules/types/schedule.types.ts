// src/modules/admin/schedules/types/schedule.types.ts

export type TipoRecurrencia = 'Diaria' | 'Laboral' | 'Fin_Semana';

export type EstadoProgramacion = 'Programado' | 'En_Curso' | 'Finalizado';

export interface Ruta {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tarifa: number;
  tiempo_estimado_total?: number;
  estado: boolean;
}

export interface Bus {
  id: string;
  placa: string;
  modelo: string;
  anio: number;
  capacidad_total: number;
  capacidad_sentados: number;
  capacidad_parados: number;
  estado: 'Operativo' | 'Mantenimiento' | 'Fuera_Servicio';
}

export interface Programacion {
  id: string;
  ruta: Ruta;
  bus: Bus;
  fecha: string;
  hora_salida: string;
  tolerancia_minutos: number;
  pasajeros_actuales: number;
  tipo_recurrencia: TipoRecurrencia;
  estado: EstadoProgramacion;
}

export interface CreateProgramacionDto {
  ruta_id: string;
  bus_id: string;
  fecha: string;
  hora_salida: string;
  tolerancia_minutos?: number;
  tipo_recurrencia: TipoRecurrencia;
  estado?: EstadoProgramacion;
}