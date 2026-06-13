import { authorizedBusinessApi } from '../../../../features/roles/utils/authorizedBusinessApi';
import { MODULES } from '../../../../shared/config/modules';

export const TipoRecurrencia = {
  DIARIA:'Diaria',
  LABORAL:'Laboral',
  FIN_SEMANA:'Fin_Semana',
} as const;

export type TipoRecurrencia = (typeof TipoRecurrencia)[keyof typeof TipoRecurrencia];

export const EstadoProgramacion = {
    PROGRAMADO: 'Programado',
    EN_CURSO:   'En_Curso',
    FINALIZADO: 'Finalizado',
} as const;

export type EstadoProgramacion = typeof EstadoProgramacion[keyof typeof EstadoProgramacion];

export interface Programacion {
  id: string;
  ruta?: { id: string; nombre?: string; codigo?: string };
  bus?: { id: string; placa?: string; capacidad_total?: number };
  fecha: string;
  hora_salida: string;
  tipo_recurrencia: string;
  estado: EstadoProgramacion;
  pasajeros_actuales: number;
  tolerancia_minutos: number;
}

export interface CreateProgramacionDto {
  ruta_id: string;
  bus_id: string;
  fecha: string;
  hora_salida: string;
  tipo_recurrencia: string;
  estado: EstadoProgramacion;
  tolerancia_minutos?: number;
}

export const schedulesService = {
  getAll: async (): Promise<Programacion[]> => {
    const response = await authorizedBusinessApi.get<Programacion[]>(MODULES.PROGRAMACIONES, '/programaciones');
    return response.data;
  },

  getById: async (id: string): Promise<Programacion> => {
    const response = await authorizedBusinessApi.get<Programacion>(MODULES.PROGRAMACIONES, `/programaciones/${id}`);
    return response.data;
  },

  create: async (dto: CreateProgramacionDto): Promise<Programacion> => {
    const response = await authorizedBusinessApi.post<Programacion>(MODULES.PROGRAMACIONES, '/programaciones', dto);
    return response.data;
  },

  update: async (id: string, dto: Partial<CreateProgramacionDto>): Promise<Programacion> => {
    const response = await authorizedBusinessApi.patch<Programacion>(MODULES.PROGRAMACIONES, `/programaciones/${id}`, dto);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await authorizedBusinessApi.delete(MODULES.PROGRAMACIONES, `/programaciones/${id}`);
  },
};