import { authorizedBusinessApi } from '../../../../features/roles/utils/authorizedBusinessApi';
import { MODULES } from '../../../../shared/config/modules';

export interface Turno {
  id: string;
  conductor?: { id: string; licencia?: string; persona?: { firstName: string; lastName: string } };
  bus?: { id: string; placa?: string };
  fecha_inicio_programada: string;
  fecha_fin_programada: string;
  fecha_inicio_real?: string;
  fecha_fin_real?: string;
  estado: 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO';
  observaciones?: string;
}

export interface CreateTurnoDto {
  conductorId: string;
  busId: string;
  fecha_inicio_programada: string;
  fecha_fin_programada: string;
}

export const turnosService = {
  getAll: async (): Promise<Turno[]> => {
    const { data } = await authorizedBusinessApi.get(MODULES.TURNOS, '/turno');
    return Array.isArray(data) ? data : [];
  },

  create: async (dto: CreateTurnoDto): Promise<Turno> => {
    const { data } = await authorizedBusinessApi.post(MODULES.TURNOS, '/turno', dto);
    return data;
  },
};