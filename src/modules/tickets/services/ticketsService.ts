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

// Ajusta esta variable a la de tu proyecto (puede ser import.meta.env.VITE_API_URL, etc.)
const BASE = import.meta.env.VITE_BUSINESS_API_URL ?? 'http://localhost:3000';

// ── Helper HTTP ──────────────────────────────────────────────────

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE}/${path.replace(/^\//, '')}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body?.message)
      ? body.message.join(', ')
      : (body?.message ?? `Error HTTP ${res.status}`);
    throw new Error(msg);
  }

  // 204 No Content (DELETE)
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Mapper: BoletoRaw → Ticket ───────────────────────────────────
// Aplana las relaciones del backend a un objeto plano que usan los componentes.

export function mapBoletoToTicket(raw: BoletoRaw): Ticket {
  return {
    id: raw.id,
    estado: raw.estado,
    tarifa_pagada: raw.tarifa_pagada ?? raw.monto_pagado,
    fecha_emision: raw.fecha_emision ?? raw.createdAt ?? new Date().toISOString(),
    qr_code: raw.qr_code ?? raw.id,

    // IDs para llamadas posteriores
    ciudadano_id:    raw.ciudadano?.id,
    programacion_id: raw.programacion?.id,
    metodo_pago_id:  raw.metodoPagoCiudadano?.id,

    // Datos para la UI
    ruta_codigo:   raw.programacion?.ruta?.codigo,
    ruta_nombre:   raw.programacion?.ruta?.nombre,
    origen_nombre: raw.paraderoAbordaje?.nombre,
    destino_nombre: raw.paraderoDescenso?.nombre ?? undefined,
  };
}

// ── Servicio público ─────────────────────────────────────────────

export const ticketsService = {

  /**
   * Obtiene todos los boletos del ciudadano autenticado.
   * El backend no tiene /mis-boletos, así que filtramos por ciudadano_id.
   * Si ciudadanoId es undefined trae todos (rol admin).
   */
  getMyTickets: async (ciudadanoId?: string): Promise<Ticket[]> => {
    const raws = await http<BoletoRaw[]>('boletos');
    const filtered = ciudadanoId
      ? raws.filter(b => b.ciudadano?.id === ciudadanoId)
      : raws;
    return filtered
      .map(mapBoletoToTicket)
      .sort((a, b) => new Date(b.fecha_emision).getTime() - new Date(a.fecha_emision).getTime());
  },

  /**
   * POST /boletos/comprar — endpoint estrella de HU-ENTR-2-003.
   * El backend valida: cupo, saldo, genera QR y registra historial.
   */
  buyTicket: async (dto: CreateBoletoDto): Promise<Ticket> => {
    const raw = await http<BoletoRaw>('boletos/comprar', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return mapBoletoToTicket(raw);
  },

  /**
   * PATCH /boletos/:id/cancelar
   * Solo funciona si estado === 'ACTIVO' (validado en backend).
   */
  cancelTicket: async (id: string): Promise<Ticket> => {
    const raw = await http<BoletoRaw>(`boletos/${id}/cancelar`, { method: 'PATCH' });
    return mapBoletoToTicket(raw);
  },

  /**
   * GET /boletos/:id
   */
  getById: async (id: string): Promise<Ticket> => {
    const raw = await http<BoletoRaw>(`boletos/${id}`);
    return mapBoletoToTicket(raw);
  },
};