// src/modules/incidents/services/incidentsService.ts
import { businessApi } from '../../../api/api';
import type {
  Incidente,
  IncidenteBus,
  CreateIncidenteDto,
  CreateIncidenteBusDto,
} from '../types/incident.types';

export const incidentsService = {

  // Crear el incidente base
  createIncidente: async (dto: CreateIncidenteDto): Promise<Incidente> => {
    const response = await businessApi.post<Incidente>('/incidentes', dto);
    return response.data;
  },

  // Asociar bus al incidente y subir fotos — multipart
  reportarConFotos: async (
    dto: CreateIncidenteBusDto,
    fotos: File[],
  ): Promise<IncidenteBus> => {
    const formData = new FormData();
    formData.append('incidente_id', dto.incidente_id);
    formData.append('bus_id', dto.bus_id);

    fotos.forEach((foto) => {
      formData.append('fotos', foto);
    });

    const response = await businessApi.post<IncidenteBus>(
      '/incidente-bus/reportar',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  addComentario: async (
    id: string,
    texto: string,
    autor?: string,
  ): Promise<Incidente> => {
    const response = await businessApi.post<Incidente>(
      `/incidentes/${id}/comentarios`,
      { texto, autor },
    );
    return response.data;
  },

  // Obtener todos los incidentes — para admin
  getAll: async (): Promise<Incidente[]> => {
    const response = await businessApi.get<Incidente[]>('/incidentes');
    return response.data;
  },

  // Obtener incidentes por bus
  getByBus: async (bus_id: string): Promise<IncidenteBus[]> => {
    const response = await businessApi.get<IncidenteBus[]>(
      `/incidente-bus/incidente/${bus_id}`,
    );
    return response.data;
  },

  // Obtener detalle de un incidente
  getById: async (id: string): Promise<Incidente> => {
    const response = await businessApi.get<Incidente>(`/incidentes/${id}`);
    return response.data;
  },

  // Actualizar estado de un incidente — para admin
  updateEstado: async (
    id: string,
    estado: 'Pendiente' | 'En_Revision' | 'Resuelto',
  ): Promise<Incidente> => {
    const response = await businessApi.patch<Incidente>(`/incidentes/${id}`, { estado });
    return response.data;
  },
};