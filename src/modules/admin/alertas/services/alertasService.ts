import { businessApi } from '../../../../api/api';

export type AlcanceAlerta = 'all' | 'route' | 'zone';

export interface CreateAlertaDto {
    titulo: string;
    mensaje: string;
    alcance: AlcanceAlerta;
    targetId?: string;
    urgente: boolean;
    programadaPara?: string;
}

export const alertasService = {
    enviar: async (dto: CreateAlertaDto) => {
        const { data } = await businessApi.post('/alerta', dto);
        return data;
    },
};