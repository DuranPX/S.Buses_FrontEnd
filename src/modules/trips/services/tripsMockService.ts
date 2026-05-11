import { withDelay } from '../../../adapters/mockAdapter';
import { MOCK_BOLETOS } from '../../../mocks/trips.mock';
import type { Trip } from '../types/trip.types';

export const tripsMockService = {
  /**
   * POST /viajes/finalizar
   * Simula marcar un boleto como Completado y asignarle el paradero de destino
   */
  finishTrip: async (boletoId: string, destinoId: string): Promise<Trip> => {
    await withDelay(null, 1000);

    const boleto = MOCK_BOLETOS.find(b => b.id === boletoId);
    if (!boleto) throw new Error('Boleto no encontrado.');

    // Simular que el viaje duró 25 minutos
    const fechaDescenso = new Date();
    const fechaAbordaje = new Date(fechaDescenso.getTime() - 25 * 60000);

    return {
      id: boletoId,
      ruta_codigo: 'R-XX', // MockBoleto doesn't have it
      ruta_nombre: boleto.ruta_nombre || 'Ruta',
      origen_nombre: boleto.paradero_abordaje_nombre || 'Origen',
      destino_nombre: destinoId === 'manual-1' ? 'Terminal (Manual)' : 'Destino Seleccionado', 
      tarifa_pagada: boleto.monto_pagado,
      fecha_abordaje: fechaAbordaje.toISOString(),
      fecha_descenso: fechaDescenso.toISOString(),
      duracion_minutos: 25,
      distancia_km: 4.2
    };
  },

  /**
   * GET /viajes/historial
   * Obtiene los boletos completados (viajes)
   */
  getHistory: async (): Promise<Trip[]> => {
    await withDelay(null, 600);

    return MOCK_BOLETOS
      .filter(b => b.estado === 'Completado')
      .map(b => {
        const abordajeStr = b.hora_abordaje || new Date().toISOString();
        const d = b.hora_descenso ? new Date(b.hora_descenso) : new Date();
        const abordaje = new Date(abordajeStr);
        return {
          id: b.id,
          ruta_codigo: 'R-XX',
          ruta_nombre: b.ruta_nombre || 'Ruta',
          origen_nombre: b.paradero_abordaje_nombre || 'Origen',
          destino_nombre: b.paradero_descenso_nombre || 'Destino',
          tarifa_pagada: b.monto_pagado,
          fecha_abordaje: abordaje.toISOString(),
          fecha_descenso: d.toISOString(),
          duracion_minutos: 30,
          distancia_km: 5.5
        };
      })
      .sort((a, b) => new Date(b.fecha_descenso).getTime() - new Date(a.fecha_descenso).getTime());
  },

  /**
   * GET /viajes/:id
   */
  getTripDetail: async (id: string): Promise<Trip | null> => {
    await withDelay(null, 400);
    const trips = await tripsMockService.getHistory();
    return trips.find(t => t.id === id) || null;
  }
};
