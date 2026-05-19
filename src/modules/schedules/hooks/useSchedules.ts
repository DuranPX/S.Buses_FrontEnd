import { useState, useEffect, useMemo } from 'react';
import { schedulesPublicService } from '../services/schedulesPublicService';
import type { ProgramacionPublica } from '../types/schedule.types';

export const useSchedules = (busqueda: string = '') => {
  const [schedules, setSchedules] = useState<ProgramacionPublica[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await schedulesPublicService.getAll();
        setSchedules(data);
      } catch {
        setError('No se pudieron cargar los horarios.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtradas = useMemo(() =>
    schedules.filter(p => {
      if (!busqueda.trim()) return true;
      const q = busqueda.toLowerCase();
      return (
        p.ruta?.nombre?.toLowerCase().includes(q) ||
        p.ruta?.codigo?.toLowerCase().includes(q) ||
        p.bus?.placa?.toLowerCase().includes(q)
      );
    }),
    [schedules, busqueda]
  );

  return { schedules: filtradas, total: schedules.length, loading, error };
};