// src/modules/programacion/services/programacionService.ts

import { businessApi } from '../../../api/api';

export interface Programacion {
  id: string;

  pasajeros_actuales: number;

  estado:
    | 'Programado'
    | 'En_Curso'
    | 'Finalizado';

  ruta: {
    id: string;
    nombre: string;
  };

  bus: {
    id: string;

    placa: string;

    modelo: string;

    capacidad_total: number;

    capacidad_sentados: number;

    capacidad_parados: number;

    estado: string;

    foto_url: string;
  };
}

export const programacionService = {
  getActivaByBus: async (
    busId: string,
  ): Promise<
    Programacion | null
  > => {
    try {
      const response =
        await businessApi.get(
          `/programaciones/bus/${busId}/activa`,
        );

      return response.data;
    } catch {
      return null;
    }
  },
};