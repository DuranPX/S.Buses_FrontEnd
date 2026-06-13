// ================================================================
// routesService.ts — Módulo Rutas
// Consume ms-business directamente usando businessApi (autenticado via JWT).
// ================================================================

import { authorizedBusinessApi } from '../../../features/roles/utils/authorizedBusinessApi';
import { MODULES } from '../../../shared/config/modules';
import type { Route, RouteFilters } from '../types/route.types';

export interface CreateRutaFullDto {
  nombre: string;
  descripcion?: string;
  tarifa: number;
  paraderos: {
    paraderoId: string;
    distanciaAnterior: number;
    tiempoEstimadoMins: number;
  }[];
  nodos?: {
    nodoId: string;
  }[];
}

export const routesService = {
  /**
   * GET /rutas — trae todas las rutas con filtros opcionales.
   */
  getAll: async (filters?: Partial<RouteFilters>): Promise<Route[]> => {
    const params: Record<string, unknown> = {};
    if (filters?.search) params.nombre = filters.search; // El contrato pide 'nombre'
    if (filters?.soloActivas) params.estado = true;

    const response = await authorizedBusinessApi.get<Route[]>(MODULES.RUTAS, '/rutas', { params });
    
    // Mapear paraderos para asegurar compatibilidad con la UI
    return response.data.map(route => ({
      ...route,
      paraderos: route.rutaParaderos || route.paraderos || []
    }));
  },

  /**
   * GET /rutas/:id — detalle básico de una ruta.
   */
  getById: async (id: string): Promise<Route | null> => {
    const response = await authorizedBusinessApi.get<Route>(MODULES.RUTAS, `/rutas/${id}`);
    return response.data;
  },

  /**
   * GET /rutas/:id/completa — detalle completo con paraderos y nodos.
   */
  getByIdComplete: async (id: string): Promise<Route | null> => {
    const response = await authorizedBusinessApi.get<Route>(MODULES.RUTAS, `/rutas/${id}/completa`);
    // Aseguramos compatibilidad si el componente usa .paraderos
    if (response.data && response.data.rutaParaderos) {
      response.data.paraderos = response.data.rutaParaderos;
    }
    return response.data;
  },

  /**
   * POST /rutas/full — crea ruta completa con paraderos en una sola transacción.
   * Según el contrato: POST /api/rutas/full
   */
  createFull: async (dto: CreateRutaFullDto): Promise<Route> => {
    const response = await authorizedBusinessApi.post<Route>(MODULES.RUTAS, '/rutas/full', dto);
    return response.data;
  },

  /**
   * PATCH /rutas/:id — actualiza datos de una ruta.
   */
  update: async (id: string, dto: Partial<CreateRutaFullDto>): Promise<Route> => {
    const response = await authorizedBusinessApi.patch<Route>(MODULES.RUTAS, `/rutas/${id}`, dto);
    return response.data;
  },

  /**
   * DELETE /rutas/:id — elimina una ruta.
   */
  delete: async (id: string): Promise<void> => {
    await authorizedBusinessApi.delete(MODULES.RUTAS, `/rutas/${id}`);
  },
};
