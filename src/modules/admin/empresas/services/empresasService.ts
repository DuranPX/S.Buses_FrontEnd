import { businessApi } from '../../../../api/api';

export interface BusItem {
  id: string;
  placa: string;
  modelo?: string;
  anio?: number;
  capacidad_total?: number;
  estado?: string;
  foto_url?: string;
  qr_code?: string;
}

export interface Empresa {
  id: string;
  nombre: string;
  nit: string;
  bus?: BusItem[];
}

export interface CreateEmpresaDto {
  nombre: string;
  nit: string;
}

export interface UpdateEmpresaDto {
  nombre?: string;
  nit?: string;
}

export const empresasService = {
  getAll: async (): Promise<Empresa[]> => {
    const response = await businessApi.get<Empresa[]>('/empresa');
    return response.data;
  },

  getById: async (id: string): Promise<Empresa> => {
    const response = await businessApi.get<Empresa>(`/empresa/${id}`);
    return response.data;
  },

  create: async (data: CreateEmpresaDto): Promise<Empresa> => {
    const response = await businessApi.post<Empresa>('/empresa', data);
    return response.data;
  },

  update: async (id: string, data: UpdateEmpresaDto): Promise<Empresa> => {
    const response = await businessApi.patch<Empresa>(`/empresa/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await businessApi.delete<{ message: string }>(`/empresa/${id}`);
    return response.data;
  }
};
