import { withDelay } from '../../../adapters/mockAdapter';
import { MOCK_PARADEROS, MOCK_RUTAS } from '../../../mocks/routes.mock';
import type { NearbyStop, Coordinates, Stop } from '../types/stop.types';

// Helper: Haversine formula to calculate distance between two coordinates in km
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const stopsMockService = {
  /**
   * GET /paraderos/cercanos
   * TODO: reemplazar con: businessApi.get('/paraderos/cercanos', { params: { lat, lng } })
   */
  getNearby: async (location: Coordinates, radiusKm = 2): Promise<NearbyStop[]> => {
    await withDelay(null, 600);
    
    // Find stops within radius and calculate distance
    const nearby: NearbyStop[] = MOCK_PARADEROS.map(p => {
      const dist = getDistance(location.lat, location.lng, p.latitud, p.longitud);
      
      // Find which routes pass through this stop
      const passingRoutes = MOCK_RUTAS
        .filter(r => r.paraderos.some(rp => rp.paradero.id === p.id))
        .map(r => r.codigo);

      return {
        ...p,
        distancia: Number(dist.toFixed(2)),
        rutas: passingRoutes
      } as NearbyStop;
    }).filter(p => p.distancia <= radiusKm);

    // Sort by closest
    return nearby.sort((a, b) => a.distancia - b.distancia);
  },

  getAll: async (): Promise<Stop[]> => {
    await withDelay(null, 500);
    return MOCK_PARADEROS as Stop[];
  }
};
