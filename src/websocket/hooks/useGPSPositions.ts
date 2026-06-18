import { useEffect, useCallback, useRef, useState } from 'react';
import { useSocketContext } from '../providers/SocketProvider';
import { WS_EVENTS } from '../events';

import type {
  BusPosicion,
  GPSPositionsState,
  RutaTrackingData,
  WsRouteBusLocationPayload,
  WsNearbyBusPayload,
  WsStopArrivalPayload,
  WsRouteDelayPayload,
} from '../../types/bus-tracking.types';

import { NivelRetraso } from '../../types/bus-tracking.types';

export const useGPSPositions = (
  trackingRoute: RutaTrackingData | null,
): GPSPositionsState => {

  const socket = useSocketContext();

  const joinedRoute = useRef<string | null>(
    null
  );

  const [state, setState] = useState<GPSPositionsState>({
    buses: new Map(),
    conectado: false,
    error: null,
    ultimaSincronizacion: null,
  });

  const busesRef = useRef<Map<string, BusPosicion>>(new Map());

  const handleLocationUpdated = useCallback(
    (payload: WsRouteBusLocationPayload) => {

      console.log(
        '[GPS] ROUTE_BUS_LOCATION_UPDATED',
        payload,
      );

      const prev = busesRef.current.get(payload.busId);

      const busPosicion: BusPosicion = {
        busId: payload.busId,
        placa: payload.placa,
        rutaId: payload.routeId,

        coordenada: {
          lat: payload.lat,
          lng: payload.lng,
        },

        velocidadKmh: payload.velocidadKmh ?? 0,

        heading: payload.heading ?? 0,

        paraderoCercano:
          prev?.paraderoCercano ?? {
            id: '',
            nombre: '',
            coordenada: {
              lat: 0,
              lng: 0,
            },
            distanciaMetros: 0,
          },

        etaSegundos:
          prev?.etaSegundos ?? 0,

        nivelRetraso:
          prev?.nivelRetraso ?? NivelRetraso.EnTiempo,

        ocupacionPorcentaje:
          prev?.ocupacionPorcentaje ?? 0,

        ultimaActualizacion:
          payload.timestamp,
      };

      const nuevoBuses = new Map(busesRef.current);

      nuevoBuses.set(
        payload.busId,
        busPosicion,
      );

      busesRef.current = nuevoBuses;

      setState(s => ({
        ...s,
        buses: nuevoBuses,
        ultimaSincronizacion: new Date().toISOString(),
      }));
    },
    [],
  );

  const handleNearbyBusUpdated = useCallback(
    (payload: WsNearbyBusPayload) => {

      const bus = busesRef.current.get(payload.busId);

      if (!bus) return;

      const actualizado: BusPosicion = {
        ...bus,

        paraderoCercano: {
          id: payload.paraderoId,
          nombre: payload.paraderoNombre,

          coordenada: {
            lat: payload.paraderoLat,
            lng: payload.paraderoLng,
          },

          distanciaMetros: payload.distanciaMetros,
        },
      };

      const nuevoBuses = new Map(busesRef.current);

      nuevoBuses.set(
        payload.busId,
        actualizado,
      );

      busesRef.current = nuevoBuses;

      setState(s => ({
        ...s,
        buses: nuevoBuses,
      }));
    },
    [],
  );

  const handleStopArrivalEstimation = useCallback(
    (payload: WsStopArrivalPayload) => {

      const bus = busesRef.current.get(payload.busId);

      if (!bus) return;

      const actualizado: BusPosicion = {
        ...bus,
        etaSegundos: payload.etaSegundos,
        ocupacionPorcentaje: payload.ocupacionPorcentaje,
      };

      const nuevoBuses = new Map(busesRef.current);

      nuevoBuses.set(
        payload.busId,
        actualizado,
      );

      busesRef.current = nuevoBuses;

      setState(s => ({
        ...s,
        buses: nuevoBuses,
      }));
    },
    [],
  );

  const handleRouteDelayUpdated = useCallback(
    (payload: WsRouteDelayPayload) => {

      const bus = busesRef.current.get(payload.busId);

      if (!bus) return;

      const actualizado: BusPosicion = {
        ...bus,
        nivelRetraso: payload.nivelRetraso,
      };

      const nuevoBuses = new Map(busesRef.current);

      nuevoBuses.set(
        payload.busId,
        actualizado,
      );

      busesRef.current = nuevoBuses;

      setState(s => ({
        ...s,
        buses: nuevoBuses,
      }));
    },
    [],
  );

  useEffect(() => {

    if (!trackingRoute)
      return;

    if (
      joinedRoute.current ===
      trackingRoute.routeId
    ) {
      return;
    }

    joinedRoute.current =
      trackingRoute.routeId;

    console.log(
      '[GPS] JOIN',
      trackingRoute.routeId
    );

    socket.emit(
      'join_route_tracking',
      {
        routeId:
          trackingRoute.routeId,

        rutaNodos:
          trackingRoute.rutaNodos,

        rutaParaderos:
          trackingRoute.rutaParaderos,
      }
    );

    setState(s => ({
      ...s,
      conectado: true,
      error: null,
    }));

    socket.off(
      WS_EVENTS.ROUTE_BUS_LOCATION_UPDATED
    );

    socket.off(
      WS_EVENTS.NEARBY_BUS_UPDATED
    );

    socket.off(
      WS_EVENTS.STOP_ARRIVAL_ESTIMATION
    );

    socket.off(
      WS_EVENTS.ROUTE_DELAY_UPDATED
    );

    socket.on(
      WS_EVENTS.ROUTE_BUS_LOCATION_UPDATED,
      handleLocationUpdated
    );

    socket.on(
      WS_EVENTS.NEARBY_BUS_UPDATED,
      handleNearbyBusUpdated
    );

    socket.on(
      WS_EVENTS.STOP_ARRIVAL_ESTIMATION,
      handleStopArrivalEstimation
    );

    socket.on(
      WS_EVENTS.ROUTE_DELAY_UPDATED,
      handleRouteDelayUpdated
    );

    return () => {

      console.log(
        '[GPS] LEAVE',
        trackingRoute.routeId
      );

      socket.emit(
        'leave_route_tracking',
        {
          routeId:
            trackingRoute.routeId
        }
      );

      joinedRoute.current =
        null;
    };

  }, [
    trackingRoute?.routeId,
    socket,
  ]);

  return state;
};