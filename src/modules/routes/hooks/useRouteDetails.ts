import { useState, useEffect } from 'react';
import { routesService } from '../services/routesService';
import type { Route } from '../types/route.types';

export const useRouteDetails = (id: string | undefined) => {
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    routesService.getByIdComplete(id).then(data => {
      if (!data) setError('Ruta no encontrada.');
      else setRoute(data);
    }).catch(() => {
      setError('Error al cargar el detalle de la ruta.');
    }).finally(() => setIsLoading(false));
  }, [id]);

  return { route, isLoading, error };
};

