// pqrs.service.ts
import { notificationsApi } from '../../../api/api';
import type {
  CrearPQRSRequest,
  CrearPQRSResponse,
  PQRS,
  CambiarEstadoPQRSRequest,
} from '../types/pqrs.types';

export const pqrsService = {
  crear: async (dto: CrearPQRSRequest): Promise<CrearPQRSResponse> => {
    const formData = new FormData();
    formData.append('tipo', dto.tipo);
    formData.append('categoria', dto.categoria);
    formData.append('descripcion', dto.descripcion);
    formData.append('emailContacto', dto.emailContacto);

    // Fotos opcionales, máximo 3
    dto.fotos?.slice(0, 3).forEach((foto) => {
      formData.append('fotos', foto);
    });

    const response = await notificationsApi.post('/pqrs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  consultar: async (radicado: string): Promise<PQRS> => {
    const response = await notificationsApi.get(`/pqrs/${radicado}`);
    return response.data;
  },

  consultar_todos: async (): Promise<PQRS[]> => {
    const response = await notificationsApi.get(`/pqrs`);
    return response.data;
  },

  cambiarEstado: async (radicado: string, dto: CambiarEstadoPQRSRequest) => {
    const response = await notificationsApi.patch(
      `/pqrs/${radicado}/estado`,
      dto,
    );
    return response.data;
  },

  obtenerFotoUrl: (pqrsId: string, fotoId: string): string => {
    const baseUrl = notificationsApi.defaults.baseURL ?? '';
    return `${baseUrl}/pqrs/${pqrsId}/fotos/${fotoId}`;
  },
};