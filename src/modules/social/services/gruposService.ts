import { businessApi } from '../../../api/api';

export interface Grupo {
  id: string;
  nombre: string;
  descripcion?: string;
  esPublico: boolean;
  imagen?: string;
  creadorAuthId?: string;
  fechaCreacion: string;
  grupoPersonas?: GrupoPersona[];
}

export interface GrupoPersona {
  id: string;
  rol: string;
  fechaUnion: string;
  grupo?: Grupo;
  persona?: {
    id: string;
    firstName: string;
    lastName: string;
    authId: string;
    email?: string;
  };
}

export interface AddMemberResponse {
  tipo?: 'INVITACION';
  mensaje?: string;
}

export interface LogEntry {
    accion: string;
    personaNombre: string;
    realizadoPorNombre: string;
    fecha: string;
}

export const gruposService = {
  getMisGrupos: async (): Promise<GrupoPersona[]> => {
    const { data } = await businessApi.get('/grupo/mis-grupos');
    return data;
  },

  getPublicos: async (nombre?: string): Promise<Grupo[]> => {
    const url = nombre ? `/grupo/publicos?nombre=${encodeURIComponent(nombre)}` : '/grupo/publicos';
    const { data } = await businessApi.get(url);
    return data;
  },

  getOne: async (id: string): Promise<Grupo> => {
    const { data } = await businessApi.get(`/grupo/${id}`);
    return data;
  },

  create: async (dto: { nombre: string; descripcion?: string; esPublico: boolean; imagen?: string; miembrosIds: string[] }): Promise<Grupo> => {
    const { data } = await businessApi.post('/grupo', dto);
    return data;
  },

  update: async (id: string, dto: { nombre?: string; descripcion?: string; esPublico?: boolean; imagen?: string }): Promise<Grupo> => {
    const { data } = await businessApi.patch(`/grupo/${id}`, dto);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await businessApi.delete(`/grupo/${id}`);
  },

  join: async (grupoId: string): Promise<void> => {
    await businessApi.post(`/grupo/${grupoId}/unirse`);
  },

  leave: async (grupoId: string): Promise<void> => {
    await businessApi.delete(`/grupo/${grupoId}/salir`);
  },

  getMembers: async (grupoId: string): Promise<GrupoPersona[]> => {
    const { data } = await businessApi.get(`/grupo/${grupoId}/miembros`);
    return data;
  },

  addMember: async (
    grupoId: string,
    personaId: string
  ): Promise<any> => {

    const { data } =
      await businessApi.post(
        `/grupo/${grupoId}/miembros`,
        { personaId }
      );

    return data;
  },

  removeMember: async (grupoId: string, personaId: string): Promise<void> => {
    await businessApi.delete(`/grupo/${grupoId}/miembros/${personaId}`);
  },

  promoteMember: async (grupoId: string, personaId: string): Promise<void> => {
    await businessApi.patch(`/grupo/${grupoId}/miembros/${personaId}/promover`);
  },

  blockMember: async (grupoId: string, personaId: string): Promise<void> => {
    await businessApi.post(`/grupo/${grupoId}/miembros/${personaId}/bloquear`);
  },

  getMisInvitaciones: async () => {

    const { data } =
      await businessApi.get(
        '/grupo/mis-invitaciones'
      );

    return data;
  },

  aceptarInvitacion: async (
    grupoId: string
  ): Promise<void> => {

    await businessApi.post(
      `/grupo/${grupoId}/aceptar-invitacion`
    );
  },

  rechazarInvitacion: async (
    grupoId: string
  ): Promise<void> => {

    await businessApi.delete(
      `/grupo/${grupoId}/rechazar-invitacion`
    );
  },

  getLog: async (grupoId: string): Promise<LogEntry[]> => {
    const { data } = await businessApi.get(`/grupo/${grupoId}/log`);
    return data;
  },
};