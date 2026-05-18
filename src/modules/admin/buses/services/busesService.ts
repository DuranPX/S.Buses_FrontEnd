import { businessApi } from '../../../../api/api';

export interface EmpresaBusInfo {
  id: string;
  nombre: string;
  nit?: string;
}

export interface Bus {
  id: string;
  placa: string;
  modelo: string;
  anio: number;
  capacidad_total: number;
  capacidad_sentados: number;
  capacidad_parados: number;
  estado: string;
  foto_url?: string;
  qr_code?: string;
  empresa?: EmpresaBusInfo;
  gps?: unknown;
  turnos?: unknown[];
  incidentes?: unknown[];
  programaciones?: unknown[];
}

export interface CreateBusDto {
  placa: string;
  modelo: string;
  anio: number;
  capacidad_total: number;
  capacidad_sentados: number;
  capacidad_parados: number;
  estado: string;
  empresaId?: string;
  foto_url?: string;
  qr_code?: string;
}

export interface UpdateBusDto {
  estado?: string;
  modelo?: string;
  anio?: number;
  capacidad_total?: number;
  capacidad_sentados?: number;
  capacidad_parados?: number;
  foto_url?: string;
}

export const busesService = {
  getAll: async (): Promise<Bus[]> => {
    const response = await businessApi.get<Bus[]>('/bus');
    return response.data;
  },

  getById: async (id: string): Promise<Bus> => {
    const response = await businessApi.get<Bus>(`/bus/${id}`);
    return response.data;
  },

  getByPlaca: async (placa: string): Promise<Bus> => {
    const response = await businessApi.get<Bus>(`/bus/placa/${placa}`);
    return response.data;
  },

  create: async (data: CreateBusDto): Promise<Bus> => {
    const response = await businessApi.post<Bus>('/bus', data);
    return response.data;
  },

  update: async (id: string, data: UpdateBusDto): Promise<Bus> => {
    const response = await businessApi.patch<Bus>(`/bus/${id}`, data);
    return response.data;
  }
};
