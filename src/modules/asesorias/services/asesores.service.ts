import { notificationsApi } from '../../../api/api';

import type {
  ConsultarDisponibilidadRequest,
  ConsultarDisponibilidadResponse,
  ConfirmarCitaRequest
} from '../types/asesor.types';

export const asesoresService = {
  consultarDisponibilidad: async (
    dto: ConsultarDisponibilidadRequest
  ): Promise<ConsultarDisponibilidadResponse> => {
    const response = await notificationsApi.post(
      '/citas/disponibilidad',
      dto
    );
    return response.data;
  },

  confirmarCita: async (
    dto: ConfirmarCitaRequest
  ): Promise<any> => {
    const response = await notificationsApi.post(
      '/citas/confirmar',
      dto
    );
    return response.data;
  }
};