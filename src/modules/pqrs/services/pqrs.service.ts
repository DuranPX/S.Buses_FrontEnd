import { notificationsApi } from '../../../api/api';

import type {
  CrearPQRSRequest,
  CrearPQRSResponse,
  PQRS,
  CambiarEstadoPQRSRequest,
} from '../types/pqrs.types';

export const pqrsService = {
  crear: async (
    dto: CrearPQRSRequest
  ): Promise<CrearPQRSResponse> => {
    const response = await notificationsApi.post(
      '/pqrs',
      dto
    );

    return response.data;
  },

  consultar: async (
    radicado: string
  ): Promise<PQRS> => {
    const response = await notificationsApi.get(
      `/pqrs/${radicado}`
    );

    return response.data;
  },

  cambiarEstado: async (
    radicado: string,
    dto: CambiarEstadoPQRSRequest
  ): Promise<any> => {
    const response = await notificationsApi.patch(
      `/pqrs/${radicado}/estado`,
      dto
    );

    return response.data;
  },
};