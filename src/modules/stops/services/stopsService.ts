import { businessApi } from '../../../api/api';
import type { NearbyStop, Coordinates, Stop } from '../types/stop.types';

export const stopsService = {
  getNearby: async (location: Coordinates, radiusMeters = 2000): Promise<NearbyStop[]> => {
    // GET /api/paraderos/cercanos?lat=-2.15&lng=-79.89&radius=1000
    const response = await businessApi.get('/paraderos/cercanos', {
      params: {
        lat: location.lat,
        lng: location.lng,
        radius: radiusMeters
      }
    });
    
    // El backend devuelve { id, nombre, latitud, longitud, distanciaMetros, rutas: [...] }
    return response.data.map((p: any) => ({
      ...p,
      // Frontend type espera "distancia" en km o la unidad que use la UI,
      // el backend devuelve "distanciaMetros"
      distancia: p.distanciaMetros ? Number((p.distanciaMetros / 1000).toFixed(2)) : 0,
      rutas: p.rutas ? p.rutas.map((r: any) => r.codigo || r.nombre) : [] // Frontend espera códigos
    }));
  },

  getAll: async (): Promise<Stop[]> => {
    const response = await businessApi.get('/paraderos');
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
    const response = await businessApi.post('/paraderos', dto);
    return response.data;
  }
};
