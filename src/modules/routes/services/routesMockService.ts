// ================================================================
// MOCK SERVICE — Rutas
// Fake service que simula las llamadas al backend.
// Cuando existan los endpoints reales, solo se cambia este archivo.
// ================================================================

import { withDelay } from '../../../adapters/mockAdapter';
import { MOCK_RUTAS } from '../../../mocks/routes.mock';
import type { Route, RouteFilters } from '../types/route.types';

// Adaptamos los datos mock al tipo Route del módulo
const toRoute = (r: typeof MOCK_RUTAS[0]): Route => r as unknown as Route;

export const routesMockService = {
  /**
   * GET /rutas
   * Devuelve todas las rutas con filtros opcionales.
   * TODO: reemplazar con: businessApi.get('/rutas', { params: filters })
   */
  getAll: async (filters?: Partial<RouteFilters>): Promise<Route[]> => {
    await withDelay(null, 500);
    let data = MOCK_RUTAS.map(toRoute);

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(r =>
        r.nombre.toLowerCase().includes(q) ||
        r.codigo.toLowerCase().includes(q)
      );
    }

    if (filters?.soloActivas) {
      data = data.filter(r => r.estado);
    }

    return data;
  },

  /**
   * GET /rutas/:id
   * TODO: reemplazar con: businessApi.get(`/rutas/${id}`)
   */
  getById: async (id: string): Promise<Route | null> => {
    await withDelay(null, 400);
    const found = MOCK_RUTAS.find(r => r.id === id);
    return found ? toRoute(found) : null;
  },
};
