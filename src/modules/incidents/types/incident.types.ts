// src/modules/incidents/types/incident.types.ts

export type TipoIncidente = 'Mecánico' | 'Accidente' | 'Retraso' | 'Otro';
export type GravedadIncidente = 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
export type EstadoIncidente = 'Pendiente' | 'En_Revision' | 'Resuelto';

export interface Incidente {
  id: string;
  tipo: TipoIncidente;
  gravedad: GravedadIncidente;
  descripcion?: string;
  seguimiento_log?: string;
  estado: EstadoIncidente;
  latitud: number;
  longitud: number;
  fecha_reporte: string;
  incidenteBuses?: IncidenteBus[];
}

export interface IncidenteBus {
  id: string;
  incidente: Incidente;
  bus: {
    id: string;
    placa: string;
    modelo: string;
  };
  fotos?: Foto[];
}

export interface Foto {
  id: string;
  url: string;
}

export interface CreateIncidenteDto {
  tipo: TipoIncidente;
  gravedad: GravedadIncidente;
  descripcion?: string;
  latitud: number;
  longitud: number;
}

export interface CreateIncidenteBusDto {
  incidente_id: string;
  bus_id: string;
}

export type Incident = Incidente;