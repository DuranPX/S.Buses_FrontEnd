export interface SlotDisponible {
  inicio: string;
  fin: string;
  label: string;
  fecha: string;
}

export interface Asesor {
  asesorId: string;
  asesorNombre: string;
  calendarId: string;
  slotsDisponibles: SlotDisponible[];
  json:any;
}

export interface ConsultarDisponibilidadRequest {
  tipoAtencion: string;
  tipoConsulta: string;
}

export interface ConfirmarCitaRequest {
  nombre: string;
  email: string;
  tipoAtencion: string;
  tipoConsulta: string;
  asesorId: string;
  calendarId: string;
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
}

export interface ConsultarDisponibilidadResponse {
  asesores?: Asesor[];
  data?: Asesor[];
  success?: boolean;
}