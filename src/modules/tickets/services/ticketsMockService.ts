import { withDelay, mockUUID } from '../../../adapters/mockAdapter';
import { MOCK_BOLETOS } from '../../../mocks/trips.mock';
import type { Ticket } from '../types/ticket.types';

// En memoria para poder "crear" nuevos boletos durante la sesión mock
// En memoria para poder "crear" nuevos boletos durante la sesión mock
let memoryTickets = MOCK_BOLETOS.map(b => ({
  id: b.id,
  ciudadano_id: b.ciudadano_id,
  metodo_pago_id: b.metodo_pago_id,
  ruta_id: b.programacion_id, // Usando programacion como ruta para el mock
  paradero_origen_id: b.paradero_abordaje_id,
  paradero_destino_id: b.paradero_descenso_id,
  tarifa_pagada: b.monto_pagado,
  estado: b.estado,
  fecha_emision: b.hora_abordaje,
  qr_code: b.qr_validacion,
  // Expandidos
  ruta_nombre: b.ruta_nombre,
  origen_nombre: b.paradero_abordaje_nombre,
  destino_nombre: b.paradero_descenso_nombre
})) as Ticket[];

export const ticketsMockService = {
  /**
   * GET /boletos/mis-boletos
   */
  getMyTickets: async (): Promise<Ticket[]> => {
    await withDelay(null, 600);
    // Filtrar los activos
    return memoryTickets
      .filter(t => t.estado === 'Activo')
      .sort((a, b) => new Date(b.fecha_emision).getTime() - new Date(a.fecha_emision).getTime());
  },

  /**
   * POST /boletos/comprar
   */
  buyTicket: async (rutaId: string, origenId: string, tarifa: number, metodoPagoId: string): Promise<Ticket> => {
    await withDelay(null, 1000);
    
    // Simular un poco de chance de error
    if (Math.random() > 0.95) {
      throw new Error('Fondos insuficientes o error en el pago.');
    }

    const newTicket: Ticket = {
      id: `bol-${mockUUID()}`,
      ciudadano_id: 'u-001', // Usuario actual mockeado
      metodo_pago_id: metodoPagoId,
      ruta_id: rutaId,
      paradero_origen_id: origenId,
      paradero_destino_id: null,
      tarifa_pagada: tarifa,
      estado: 'Activo',
      fecha_emision: new Date().toISOString(),
      qr_code: `QR-DATA-${Date.now()}`
    };

    memoryTickets = [newTicket, ...memoryTickets];
    return newTicket;
  }
};
