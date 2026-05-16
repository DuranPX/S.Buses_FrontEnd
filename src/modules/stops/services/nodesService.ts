import { businessApi } from '../../../api/api';

export interface Node {
  id: string;
  latitud: number;
  longitud: number;
}

export interface CreateNodeDto {
  latitud: number;
  longitud: number;
}

export const nodesService = {
  getAll: async (): Promise<Node[]> => {
    const response = await businessApi.get<Node[]>('/nodos');
    return response.data;
  },

  create: async (dto: CreateNodeDto): Promise<Node> => {
    const response = await businessApi.post<Node>('/nodos', dto);
    return response.data;
  },

  getById: async (id: string): Promise<Node> => {
    const response = await businessApi.get<Node>(`/nodos/${id}`);
    return response.data;
  }
};
