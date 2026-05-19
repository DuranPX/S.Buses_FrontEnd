export interface ProgramacionPublica {
  id: string;
  ruta?: { id: string; nombre?: string; codigo?: string };
  bus?: { id: string; placa?: string; capacidad_total?: number };
  fecha: string;
  hora_salida: string;
  tipo_recurrencia: string;
  estado: string;
  pasajeros_actuales: number;
  tolerancia_minutos: number;
}