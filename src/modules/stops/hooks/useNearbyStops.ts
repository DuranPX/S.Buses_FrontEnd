import { useState, useEffect } from 'react';
import { stopsService } from '../services/stopsService';
import type { NearbyStop, Coordinates } from '../types/stop.types';

export const useNearbyStops = (location: Coordinates | null) => {
  const [stops, setStops] = useState<NearbyStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!location) return;

    const fetchStops = async () => {
      setLoading(true);
      try {
        const nearbyStops = await stopsService.getNearby(location, 2000); // 2000 meters = 2km
        setStops(nearbyStops);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch nearby stops'));
      } finally {
        setLoading(false);
      }
    };

    fetchStops();
  }, [location?.lat, location?.lng]);

  return { stops, loading, error };
};
