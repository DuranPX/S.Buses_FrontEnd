import { businessApi } from '../../../api/api';

export interface MensajeBandeja {
  id: string;
  tipo: 'individual' | 'grupal';
  leido: boolean;
  mensaje: { id: string; contenido: string; fechaEnvio: string; tipo: string };
  emisor: { id: string; firstName: string; lastName: string };
  grupo?: { id: string; nombre: string };
  destPersonaId?: string;
}

export const mensajesService = {
  getBandeja: async (soloNoLeidos = false): Promise<MensajeBandeja[]> => {
    const { data } = await businessApi.get(`/mensaje/bandeja?soloNoLeidos=${soloNoLeidos}`);
    return data;
  },

  countNoLeidos: async (): Promise<number> => {
    const { data } = await businessApi.get('/mensaje/no-leidos/count');
    return typeof data === 'number' ? data : 0;
  },

  marcarLeido: async (destPersonaId: string): Promise<void> => {
    await businessApi.patch(`/mensaje/leido/${destPersonaId}`);
  },

  enviar: async (dto: { emisorId: string; contenido: string; destinatarioPersonaId?: string; destinatarioGrupoId?: string }): Promise<void> => {
    await businessApi.post('/mensaje', dto);
  },
};