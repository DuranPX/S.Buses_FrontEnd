// ================================================================
// HOOK — useGPSPositions
// Proyecto: Frontend (S.Buses_FrontEnd)
// Ruta: src/websocket/hooks/useGPSPositions.ts
//
// Responsabilidad única (SRP): escuchar posiciones GPS de buses
// de una ruta específica y mantener el estado actualizado.
//
// Eventos reales del ms-business (transport.gateway.ts):
//   - join_route_tracking  → unirse al room route:{routeId}
//   - ROUTE_BUS_LOCATION_UPDATED → { busId, lat, lng, timestamp }
//
// Eventos pendientes de implementar en el backend
// (definidos en WS_EVENTS pero aún sin emit):
//   - NEARBY_BUS_UPDATED      → paradero más cercano
//   - STOP_ARRIVAL_ESTIMATION → ETA al paradero
//   - ROUTE_DELAY_UPDATED     → nivel de retraso
// Mientras tanto se calculan/simulan localmente en mock mode.
// ================================================================

import { useEffect, useCallback, useRef, useState } from 'react';
import { useSocketContext } from '../providers/SocketProvider';
import { WS_EVENTS } from '../events';
import type {
  BusPosicion,
  GPSPositionsState,
  WsRouteBusLocationPayload,
  WsNearbyBusPayload,
  WsStopArrivalPayload,
  WsRouteDelayPayload,
} from '../../types/bus-tracking.types';
import { NivelRetraso } from '../../types/bus-tracking.types';

// CONSTANTES

const INTERVALO_ACTUALIZACION_MS = 10_000; // 10 segundos
const UMBRAL_RETRASO_LEVE_S      = 60;     // 1 min
const UMBRAL_RETRASO_MODERADO_S  = 300;    // 5 min
const UMBRAL_RETRASO_CRITICO_S   = 900;    // 15 min


// HELPERS PRIVADOS

/** Calcula el nivel de retraso a partir de los segundos de demora */
function calcularNivelRetraso(retrasoSegundos: number): NivelRetraso {
  if (retrasoSegundos >= UMBRAL_RETRASO_CRITICO_S)  return NivelRetraso.Critico;
  if (retrasoSegundos >= UMBRAL_RETRASO_MODERADO_S) return NivelRetraso.Moderado;
  if (retrasoSegundos >= UMBRAL_RETRASO_LEVE_S)     return NivelRetraso.Leve;
  return NivelRetraso.EnTiempo;
}

/**
 * Mientras el backend no emita NEARBY_BUS_UPDATED / STOP_ARRIVAL_ESTIMATION,
 * generamos datos mock realistas basados en la posición del bus.
 * Reemplazar con los handlers reales cuando el backend los implemente.
 */
function generarDatosMockParadero(busId: string, lat: number, lng: number) {
  // Simulación determinista basada en el busId para consistencia
  const seed = busId.charCodeAt(busId.length - 1) % 5;
  const paraderosMock = [
    { id: 'p-001', nombre: 'Terminal Central',     lat: lat + 0.002, lng: lng + 0.001 },
    { id: 'p-002', nombre: 'Parque Caldas',        lat: lat - 0.001, lng: lng + 0.002 },
    { id: 'p-003', nombre: 'Universidad Nacional', lat: lat + 0.003, lng: lng - 0.001 },
    { id: 'p-004', nombre: 'Centro Comercial',     lat: lat - 0.002, lng: lng - 0.002 },
    { id: 'p-005', nombre: 'Hospital Universitario', lat: lat + 0.001, lng: lng + 0.003 },
  ];
  const paradero = paraderosMock[seed];
  const distanciaMetros = Math.floor(150 + seed * 80);
  const etaSegundos     = Math.floor(60  + seed * 90);
  const retrasoSegundos = seed * 120;

  return { paradero, distanciaMetros, etaSegundos, retrasoSegundos };
}

/** Construye un BusPosicion completo combinando payload real + datos mock */
function construirBusPosicion(
  prev: BusPosicion | undefined,
  locationPayload: WsRouteBusLocationPayload,
): BusPosicion {
  const mock = generarDatosMockParadero(
    locationPayload.busId,
    locationPayload.lat,
    locationPayload.lng,
  );

  return {
    busId:    locationPayload.busId,
    placa:    locationPayload.placa ?? prev?.placa ?? locationPayload.busId,
    rutaId:   locationPayload.routeId,
    coordenada: { lat: locationPayload.lat, lng: locationPayload.lng },
    velocidadKmh:        locationPayload.velocidadKmh  ?? prev?.velocidadKmh  ?? 0,
    heading:             locationPayload.heading        ?? prev?.heading        ?? 0,
    paraderoCercano: {
      id:              prev?.paraderoCercano.id      ?? mock.paradero.id,
      nombre:          prev?.paraderoCercano.nombre  ?? mock.paradero.nombre,
      coordenada: {
        lat: mock.paradero.lat,
        lng: mock.paradero.lng,
      },
      distanciaMetros: mock.distanciaMetros,
    },
    etaSegundos:    mock.etaSegundos,
    nivelRetraso:   calcularNivelRetraso(mock.retrasoSegundos),
    ocupacionPorcentaje: prev?.ocupacionPorcentaje ?? 0,
    ultimaActualizacion: locationPayload.timestamp ?? new Date().toISOString(),
  };
}

// ----------------------------------------------------------------
// HOOK PRINCIPAL
// ----------------------------------------------------------------

export const useGPSPositions = (rutaId: string): GPSPositionsState => {
  const socket = useSocketContext();

  const [state, setState] = useState<GPSPositionsState>({
    buses:               new Map(),
    conectado:           false,
    error:               null,
    ultimaSincronizacion: null,
  });

  // Ref para acceder al estado actual dentro de los callbacks sin stale closure
  const busesRef = useRef<Map<string, BusPosicion>>(new Map());

  // ---- Handlers de eventos WebSocket ----

  /** Handler real: posición GPS del bus (ya implementado en el backend) */
  const handleLocationUpdated = useCallback((payload: WsRouteBusLocationPayload) => {
    const prev = busesRef.current.get(payload.busId);
    const busPosicion = construirBusPosicion(prev, payload);

    const nuevoBuses = new Map(busesRef.current);
    nuevoBuses.set(payload.busId, busPosicion);
    busesRef.current = nuevoBuses;

    setState(s => ({
      ...s,
      buses: nuevoBuses,
      ultimaSincronizacion: new Date().toISOString(),
    }));
  }, []);

  /**
   * Handler futuro: paradero más cercano
   * Conectar cuando el ms-business implemente el emit de NEARBY_BUS_UPDATED
   */
  const handleNearbyBusUpdated = useCallback((payload: WsNearbyBusPayload) => {
    const bus = busesRef.current.get(payload.busId);
    if (!bus) return;

    const actualizado: BusPosicion = {
      ...bus,
      paraderoCercano: {
        id:      payload.paraderoId,
        nombre:  payload.paraderoNombre,
        coordenada: { lat: payload.paraderoLat, lng: payload.paraderoLng },
        distanciaMetros: payload.distanciaMetros,
      },
    };

    const nuevoBuses = new Map(busesRef.current);
    nuevoBuses.set(payload.busId, actualizado);
    busesRef.current = nuevoBuses;
    setState(s => ({ ...s, buses: nuevoBuses }));
  }, []);

  /**
   * Handler futuro: ETA y ocupación
   * Conectar cuando el ms-business implemente el emit de STOP_ARRIVAL_ESTIMATION
   */
  const handleStopArrivalEstimation = useCallback((payload: WsStopArrivalPayload) => {
    const bus = busesRef.current.get(payload.busId);
    if (!bus) return;

    const actualizado: BusPosicion = {
      ...bus,
      etaSegundos:         payload.etaSegundos,
      ocupacionPorcentaje: payload.ocupacionPorcentaje,
    };

    const nuevoBuses = new Map(busesRef.current);
    nuevoBuses.set(payload.busId, actualizado);
    busesRef.current = nuevoBuses;
    setState(s => ({ ...s, buses: nuevoBuses }));
  }, []);

  /**
   * Handler futuro: nivel de retraso
   * Conectar cuando el ms-business implemente el emit de ROUTE_DELAY_UPDATED
   */
  const handleRouteDelayUpdated = useCallback((payload: WsRouteDelayPayload) => {
    const bus = busesRef.current.get(payload.busId);
    if (!bus) return;

    const actualizado: BusPosicion = {
      ...bus,
      nivelRetraso: payload.nivelRetraso,
    };

    const nuevoBuses = new Map(busesRef.current);
    nuevoBuses.set(payload.busId, actualizado);
    busesRef.current = nuevoBuses;
    setState(s => ({ ...s, buses: nuevoBuses }));
  }, []);

  // ---- Efecto principal: suscripción y cleanup ----

  useEffect(() => {
    if (!rutaId) return;

    // 1. Unirse al room de la ruta (join_route_tracking del transport.gateway.ts)
    socket.emit('join_route_tracking', { routeId: rutaId });
    setState(s => ({ ...s, conectado: true, error: null }));

    // 2. Suscribir eventos
    socket.on(WS_EVENTS.ROUTE_BUS_LOCATION_UPDATED, handleLocationUpdated as (...args: unknown[]) => void);
    socket.on(WS_EVENTS.NEARBY_BUS_UPDATED,         handleNearbyBusUpdated as (...args: unknown[]) => void);
    socket.on(WS_EVENTS.STOP_ARRIVAL_ESTIMATION,    handleStopArrivalEstimation as (...args: unknown[]) => void);
    socket.on(WS_EVENTS.ROUTE_DELAY_UPDATED,        handleRouteDelayUpdated as (...args: unknown[]) => void);

    // 3. Polling de respaldo cada 10s (por si se pierden eventos WebSocket)
    const intervalo = setInterval(() => {
      setState(s => ({
        ...s,
        ultimaSincronizacion: new Date().toISOString(),
      }));
    }, INTERVALO_ACTUALIZACION_MS);

    // 4. Cleanup al desmontar o cambiar rutaId
    return () => {
      socket.emit('leave_route_tracking', { routeId: rutaId });
      socket.off(WS_EVENTS.ROUTE_BUS_LOCATION_UPDATED, handleLocationUpdated as (...args: unknown[]) => void);
      socket.off(WS_EVENTS.NEARBY_BUS_UPDATED,         handleNearbyBusUpdated as (...args: unknown[]) => void);
      socket.off(WS_EVENTS.STOP_ARRIVAL_ESTIMATION,    handleStopArrivalEstimation as (...args: unknown[]) => void);
      socket.off(WS_EVENTS.ROUTE_DELAY_UPDATED,        handleRouteDelayUpdated as (...args: unknown[]) => void);
      clearInterval(intervalo);
      busesRef.current = new Map();
      setState({
        buses: new Map(),
        conectado: false,
        error: null,
        ultimaSincronizacion: null,
      });
    };
  }, [rutaId, socket, handleLocationUpdated, handleNearbyBusUpdated, handleStopArrivalEstimation, handleRouteDelayUpdated]);

  return state;
};