import { useState, useEffect, useCallback } from 'react';
import { routesService } from '../services/routesService';
import type { Route, RouteFilters } from '../types/route.types';

export const useRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RouteFilters>({ search: '', soloActivas: false });

  const fetchRoutes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await routesService.getAll(filters);
      setRoutes(data);
    } catch {
      setError('No se pudieron cargar las rutas.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchRoutes(); }, [fetchRoutes]);

  return { routes, isLoading, error, filters, setFilters, refetch: fetchRoutes };
};

