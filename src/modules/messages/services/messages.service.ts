import { businessApi } from '../../../api/api';
import type {
  Persona,
  Mensaje,
  CreateMensajeDto,
  CreateDestinatarioDto,
} from '../types/message';

export const messagesService = {

  searchUsers: async (
    query: string,
  ): Promise<Persona[]> => {

    const response = await businessApi.get(
      `/persona/search?q=${query}`,
    );

    return response.data;
  },

  createMessage: async (
    dto: CreateMensajeDto,
  ): Promise<Mensaje> => {

    const response = await businessApi.post(
      '/mensaje',
      dto,
    );

    return response.data;
  },

  assignRecipient: async (
    dto: CreateDestinatarioDto,
  ) => {

    const response = await businessApi.post(
      '/destinatario-persona',
      dto,
    );

    return response.data;
  },

  getSentMessages: async (
    personaId: string,
  ): Promise<Mensaje[]> => {

    const response = await businessApi.get(
      `/mensaje/enviados/${personaId}`,
    );

    return response.data;
  },

};