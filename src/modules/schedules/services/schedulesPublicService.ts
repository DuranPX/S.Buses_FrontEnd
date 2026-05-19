import { businessApi } from '../../../api/api';
import type { ProgramacionPublica } from '../types/schedule.types';

export const schedulesPublicService = {
  getAll: async (): Promise<ProgramacionPublica[]> => {
    const response = await businessApi.get<ProgramacionPublica[]>('/programaciones');
    return response.data.filter(p => p.estado !== 'Finalizado');
  },
};