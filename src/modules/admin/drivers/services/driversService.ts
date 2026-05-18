import { businessApi } from '../../../../api/api';

export interface ConductorPersona {
  id: string;
  nombres?: string;
  apellidos?: string;
  identificacion?: string;
}

export interface Empresa {
  id: string;
  nombre: string;
  nit?: string;
}

export interface Turno {
  id: string;
  nombre?: string;
  hora_inicio?: string;
  hora_fin?: string;
}

export interface Conductor {
  id: string;
  licencia?: string;
  activo?: boolean;
  estado?: string;
  persona?: ConductorPersona;
  nombres?: string;
  apellidos?: string;
  empresas?: Empresa[];
  turnos?: Turno[];
  calificacion?: number;
}

export interface UpdateConductorDto {
  empresasIds: string[];
  turnosIds?: string[];
  activo?: boolean;
}

export const driversService = {
  /**
   * Cargar Conductores: GET /api/conductor
   * Devuelve todos los conductores y su información de persona
   */
  getAllDrivers: async (): Promise<Conductor[]> => {
    const res = await businessApi.get<Conductor[]>('/conductor');
    return res.data;
  },

  /**
   * Cargar Empresas: GET /api/empresa
   * Devuelve la lista de empresas de transporte disponibles
   */
  getAllEmpresas: async (): Promise<Empresa[]> => {
    const res = await businessApi.get<Empresa[]>('/empresa');
    return res.data;
  },

  /**
   * Cargar Turnos: GET /api/turno
   * Devuelve los turnos disponibles
   */
  getAllTurnos: async (): Promise<Turno[]> => {
    const res = await businessApi.get<Turno[]>('/turno');
    return res.data;
  },

  /**
   * Enviar la Asociación al Backend: PATCH /api/conductor/{conductorId}
   */
  associateConductor: async (conductorId: string, dto: UpdateConductorDto): Promise<Conductor> => {
    const res = await businessApi.patch<Conductor>(`/conductor/${conductorId}`, dto);
    return res.data;
  }
};
