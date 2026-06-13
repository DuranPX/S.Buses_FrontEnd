import { authorizedBusinessApi } from '../../../features/roles/utils/authorizedBusinessApi';
import { MODULES } from '../../../shared/config/modules';
import type { NearbyStop, Coordinates, Stop } from '../types/stop.types';

export const stopsService = {
  getNearby: async (location: Coordinates, radiusMeters = 2000): Promise<NearbyStop[]> => {
    const response = await authorizedBusinessApi.get(MODULES.PARADEROS, '/paraderos/cercanos', {
      params: {
        lat: location.lat,
        lng: location.lng,
        radius: radiusMeters
      }
    });
    
    // El backend devuelve { id, nombre, latitud, longitud, distanciaMetros, rutas: [...] }
    // Filtramos los 5 más cercanos
    return response.data.slice(0, 5).map((p: any) => ({
      ...p,
      // Usamos metros directamente según requerimiento HU-ENTR-2-002
      distancia: Math.round(p.distanciaMetros || 0),
      rutas: p.rutas ? p.rutas.map((r: any) => r.codigo || r.nombre) : []
    }));
  },

  getAll: async (): Promise<Stop[]> => {
    const response = await authorizedBusinessApi.get(MODULES.PARADEROS, '/paraderos');
    return response.data;
  },

  create: async (dto: { 
    codigo: string; 
    nombre: string; 
    latitud: number; 
    longitud: number; 
    tipo?: string; 
    estado?: boolean;
    nodo_id: string;
  }): Promise<Stop> => {
    const response = await authorizedBusinessApi.post(MODULES.PARADEROS, '/paraderos', dto);
    return response.data;
  }
};
