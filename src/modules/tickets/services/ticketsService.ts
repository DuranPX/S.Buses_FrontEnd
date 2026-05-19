// ================================================================
// tickets.service.ts — Módulo Boletos
// Reemplaza ticketsMockService. Consume el ms-business directamente.
//
// Rutas utilizadas (confirmadas en el log de NestJS):
//   GET    /boletos            → findAll (se filtra por ciudadano_id en cliente)
//   POST   /boletos/comprar    → comprar
//   PATCH  /boletos/:id/cancelar
// ================================================================

import type { BoletoRaw, CreateBoletoDto, Ticket } from '../types/ticket.types';
import { businessApi } from '../../../api/api';

// ── Mapper: BoletoRaw → Ticket ───────────────────────────────────
export function mapBoletoToTicket(raw: BoletoRaw): Ticket {
  return {
    id: raw.id,
    estado: raw.estado,
    monto_pagado: typeof raw.monto_pagado === 'string' ? parseFloat(raw.monto_pagado) : raw.monto_pagado,
    fecha_emision: raw.fecha_emision ?? raw.createdAt ?? raw.hora_abordaje ?? new Date().toISOString(),
    hora_abordaje: raw.hora_abordaje,
    hora_descenso: raw.hora_descenso,
    qr_code: raw.qr_validacion ?? raw.id,

    ciudadano_id: raw.ciudadano?.id,
    programacion_id: raw.programacion?.id,
    metodo_pago_id: raw.metodoPagoCiudadano?.id,

    ruta_codigo: raw.programacion?.ruta?.codigo,
    ruta_nombre: raw.programacion?.ruta?.nombre,
    origen_nombre: raw.paraderoAbordaje?.nombre,
    destino_nombre: raw.paraderoDescenso?.nombre ?? undefined,

    programacion_estado: raw.programacion?.estado,
    tolerancia_minutos: raw.programacion?.tolerancia_minutos,
  };
}

export const ticketsService = {
  getMyTickets: async (): Promise<Ticket[]> => {
  const res = await businessApi.get<BoletoRaw[]>('/boletos/me');

  return res.data
    .map(mapBoletoToTicket)
    .sort((a, b) =>
      new Date(b.hora_abordaje).getTime() -
      new Date(a.hora_abordaje).getTime()
    );
},

  buyTicket: async (dto: CreateBoletoDto): Promise<Ticket> => {
    const res = await businessApi.post<BoletoRaw>('/boletos/abordaje', dto);
    return mapBoletoToTicket(res.data);
  },

  registerDescenso: async (boletoId: string, paraderoDescensoId: string) => {
    const res = await businessApi.patch(`/boletos/${boletoId}/descenso`, { paraderoDescensoId });
    return res.data;
  },

  cancelTicket: async (id: string): Promise<Ticket> => {
    const res = await businessApi.patch<BoletoRaw>(`/boletos/${id}/cancelar`);
    return mapBoletoToTicket(res.data);
  },

  getById: async (id: string): Promise<Ticket> => {
    const res = await businessApi.get<BoletoRaw>(`/boletos/${id}`);
    return mapBoletoToTicket(res.data);
  },
};