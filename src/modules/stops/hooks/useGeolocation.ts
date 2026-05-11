import { useState, useEffect } from 'react';
import type { Coordinates } from '../types/stop.types';

export const useGeolocation = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada por el navegador.');
      setIsLoading(false);
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        // Usamos una ubicación por defecto en Manizales si el usuario deniega el permiso en dev
        setLocation({ lat: 5.0683, lng: -75.5173 }); // Parque Caldas
        setError('Permiso denegado o error al obtener ubicación. Usando ubicación por defecto.');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  return { location, error, isLoading };
};
