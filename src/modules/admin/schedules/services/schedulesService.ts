import { businessApi } from '../../../../api/api';

export const TipoRecurrencia = {
  DIARIA: 'Diaria',
  LABORAL: 'Laboral',
  FIN_SEMANA: 'Fin de semana',
} as const;

export type TipoRecurrencia =
  (typeof TipoRecurrencia)[keyof typeof TipoRecurrencia];

export interface Programacion {
  id: string;
  ruta?: { id: string; nombre?: string; codigo?: string };
  bus?: { id: string; placa?: string; capacidad_total?: number };
  fecha: string;
  hora_salida: string;
  tipo_recurrencia: string;
  estado: string;
  pasajeros_actuales: number;
}

export interface CreateProgramacionDto {
  ruta_id: string;
  bus_id: string;
  fecha: string;
  hora_salida: string;
  tipo_recurrencia: string;
  tolerancia_minutos?: number;
}

export const schedulesService = {
  getAll: async (): Promise<Programacion[]> => {
    const response = await businessApi.get<Programacion[]>('/programaciones');
    return response.data;
  },

  create: async (dto: CreateProgramacionDto): Promise<Programacion> => {
    const response = await businessApi.post<Programacion>('/programaciones', dto);
    return response.data;
  }
};
