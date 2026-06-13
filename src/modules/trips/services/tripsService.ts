// src/modules/trips/services/tripsService.ts
import { businessApi } from '../../../api/api';
import { authorizedBusinessApi } from '../../../features/roles/utils/authorizedBusinessApi';
import { MODULES } from '../../../shared/config/modules';
import type { Trip } from '../types/trip.types';

const adaptBoleto = (boleto: any): Trip => {
  const abordaje = boleto.hora_abordaje
    ? new Date(boleto.hora_abordaje)
    : new Date();
  const descenso = boleto.hora_descenso
    ? new Date(boleto.hora_descenso)
    : new Date();

  const duracion = Math.round(
    (descenso.getTime() - abordaje.getTime()) / 60000
  );

  const bus = boleto.programacion?.bus;
  const turno = boleto.programacion?.turno;
  const conductor = turno?.conductor;

  return {
    id: boleto.id,
    ruta_codigo: boleto.programacion?.ruta?.codigo || 'N/A',
    ruta_nombre: boleto.programacion?.ruta?.nombre || 'Ruta',
    origen_nombre: boleto.paraderoAbordaje?.nombre || 'Origen',
    destino_nombre: boleto.paraderoDescenso?.nombre || 'Destino',
    tarifa_pagada: Number(boleto.monto_pagado),
    fecha_abordaje: abordaje.toISOString(),
    fecha_descenso: descenso.toISOString(),
    duracion_minutos: duracion,
    paraderoAbordaje: boleto.paraderoAbordaje
      ? {
          id: boleto.paraderoAbordaje.id,
          nombre: boleto.paraderoAbordaje.nombre,
          latitud: Number(boleto.paraderoAbordaje.latitud),
          longitud: Number(boleto.paraderoAbordaje.longitud),
        }
      : undefined,
    paraderoDescenso: boleto.paraderoDescenso
      ? {
          id: boleto.paraderoDescenso.id,
          nombre: boleto.paraderoDescenso.nombre,
          latitud: Number(boleto.paraderoDescenso.latitud),
          longitud: Number(boleto.paraderoDescenso.longitud),
        }
      : undefined,
    bus: bus
      ? { id: bus.id, placa: bus.placa, modelo: bus.modelo }
      : undefined,
    conductor: conductor?.persona
      ? {
          id: conductor.id,
          nombre: `${conductor.persona.firstName} ${conductor.persona.lastName}`,
          licencia: conductor.licencia,
        }
      : undefined,
  };
};

export const tripsService = {

  // Paso 1: obtener ciudadano_id a partir del authId del MS-Security
  getCiudadanoId: async (authId: string): Promise<string> => {
    const { data } = await businessApi.get(`/ciudadano?authId=${authId}`);
    // El backend devuelve array — buscamos el que coincide con el authId
    const ciudadano = Array.isArray(data)
      ? data.find((c: any) => c.persona?.authId === authId)
      : data;
    if (!ciudadano) throw new Error('Ciudadano no encontrado');
    return ciudadano.id;
  },

  // Historial de viajes del ciudadano autenticado
  getHistory: async (): Promise<Trip[]> => {
    const { data } = await authorizedBusinessApi.get(MODULES.VIAJES, '/boletos/mis-viajes');
    return data.map(adaptBoleto);
  },

  // GET /boletos/:id/detalle — detalle completo del viaje
  getTripDetail: async (id: string): Promise<Trip> => {
    const { data } = await authorizedBusinessApi.get(MODULES.VIAJES, `/boletos/${id}/detalle`);
    return adaptBoleto(data);
  },

  finishTrip: async (boletoId: string, destinoId: string): Promise<Trip> => {
    const { data } = await authorizedBusinessApi.patch(MODULES.BOLETOS, `/boletos/${boletoId}/descenso`, {
      paraderoDescensoId: destinoId,
    });
    return adaptBoleto(data);
  },
};