// src/modules/programacion/hooks/useDashboardBuses.ts
import { useEffect, useState, useCallback } from 'react';
import { incidentsService } from '../../incidents/services/incidentsService';
import { programacionService } from '../services/progrmacionService';
import type { Incidente } from '../../incidents/types/incident.types';

export interface BusDashboard {
  id: string;
  placa: string;
  modelo: string;
  latitud: number;
  longitud: number;
  pasajeros: number;
  capacidad: number;
  ocupacion: number;
  tieneIncidente: boolean;
  incidenteActivo: Incidente | undefined;
  rutaNombre: string;
}

export const useDashboardBuses = () => {
  const [buses, setBuses] = useState<BusDashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Traer todos los incidentes
      const incidents = await incidentsService.getAll();

      // 2. Obtener buses únicos de los incidentes
      const busMap = new Map<string, { id: string; placa: string; modelo: string }>();
      for (const incidente of incidents) {
        for (const ib of incidente.incidenteBuses ?? []) {
          if (!busMap.has(ib.bus.id)) {
            busMap.set(ib.bus.id, ib.bus);
          }
        }
      }

      const busIds = [...busMap.keys()];

      // 3. Consultar programación activa de cada bus en paralelo
      const programas = await Promise.all(
        busIds.map((id) => programacionService.getActivaByBus(id))
      );

      // 4. Construir el resultado
      const resultado: BusDashboard[] = busIds.map((busId, index) => {
        const busInfo = busMap.get(busId)!;
        const programa = programas[index];

        // Incidente activo más reciente para este bus
        const incidenteActivo = incidents.find(
          (i) =>
            i.estado !== 'Resuelto' &&
            i.incidenteBuses?.some((ib) => ib.bus.id === busId)
        );

        // Coordenadas: del incidente activo, o del más reciente si no hay
        const incidenteConCoords =
          incidenteActivo ??
          incidents
            .filter((i) => i.incidenteBuses?.some((ib) => ib.bus.id === busId))
            .sort(
              (a, b) =>
                new Date(b.fecha_reporte).getTime() -
                new Date(a.fecha_reporte).getTime()
            )[0];

        const lat = Number(incidenteConCoords?.latitud ?? 0);
        const lng = Number(incidenteConCoords?.longitud ?? 0);

        const pasajeros = programa?.pasajeros_actuales ?? 0;
        const capacidad = programa?.bus.capacidad_total ?? 0;
        const ocupacion = capacidad > 0 ? (pasajeros / capacidad) * 100 : 0;

        return {
          id: busId,
          placa: programa?.bus.placa ?? busInfo.placa,
          modelo: programa?.bus.modelo ?? busInfo.modelo,
          latitud: lat,
          longitud: lng,
          pasajeros,
          capacidad,
          ocupacion,
          tieneIncidente: Boolean(incidenteActivo),
          incidenteActivo,
          rutaNombre: programa?.ruta.nombre ?? 'Sin programación activa',
        };
      });

      setBuses(resultado);
    } catch (err) {
      console.error('Error cargando dashboard de buses:', err);
      setError('No se pudo cargar la información de la flota');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 30_000);
    return () => clearInterval(interval);
  }, [cargar]);

  return { buses, loading, error, refetch: cargar };
};