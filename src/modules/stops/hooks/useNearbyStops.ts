import { useState, useEffect } from 'react';
import { stopsMockService } from '../services/stopsMockService';
import type { NearbyStop, Coordinates } from '../types/stop.types';

export const useNearbyStops = (location: Coordinates | null) => {
  const [stops, setStops] = useState<NearbyStop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location) return;

    setIsLoading(true);
    setError(null);

    stopsMockService.getNearby(location, 2) // 2km radius
      .then(data => setStops(data))
      .catch(() => setError('Error al cargar paraderos cercanos.'))
      .finally(() => setIsLoading(false));
  }, [location]);

  return { stops, isLoading, error };
};
