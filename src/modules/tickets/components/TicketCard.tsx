// ================================================================
// TicketCard.tsx — Módulo Boletos
// Tarjeta visual de boleto activo. Usa campos normalizados (Ticket).
// Incluye acción de cancelación y mapeo correcto de EstadoBoleto.
// ================================================================

import { useState } from 'react';
import type { Ticket, EstadoBoleto } from '../types/ticket.types';
import { TicketQR } from './TicketQR';

// ── Helpers de presentación ──────────────────────────────────────

const ESTADO_LABEL: Record<EstadoBoleto, string> = {
  Activo:     'Activo',
  Completado: 'Completado',
  Cancelado:  'Cancelado',
};

const ESTADO_COLORS: Record<EstadoBoleto, { bg: string; text: string }> = {
  Activo:     { bg: 'white',                    text: '#6366f1' },
  Completado: { bg: 'rgba(52,211,153,0.15)',     text: '#34d399' },
  Cancelado:  { bg: 'rgba(239,68,68,0.15)',      text: '#ef4444' },
};

// ── Props ────────────────────────────────────────────────────────

interface Props {
  ticket: Ticket;
  /** Si se pasa, muestra el botón "Cancelar". Omítelo en vistas de solo lectura. */
  onCancel?: (id: string) => Promise<void>;
}

// ── Componente ───────────────────────────────────────────────────

export const TicketCard = ({ ticket, onCancel }: Props) => {
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const date = ticket.fecha_emision ? new Date(ticket.fecha_emision) : null;
  const dateStr =
    date && !isNaN(date.getTime())
      ? date.toLocaleString('es-CO', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Fecha no disponible';

  const priceStr =
    typeof ticket.monto_pagado === 'number'
      ? `$${ticket.monto_pagado.toLocaleString('es-CO')}`
      : '---';

  const boardingDate = ticket.hora_abordaje ? new Date(ticket.hora_abordaje) : null;
  const boardingStr =
    boardingDate && !isNaN(boardingDate.getTime())
      ? boardingDate.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '--:--';

  const estadoColors = ESTADO_COLORS[ticket.estado] ?? ESTADO_COLORS.Activo;

  const handleCancel = async () => {
    if (!onCancel) return;
    setCancelError('');
    setCancelling(true);
    try {
      await onCancel(ticket.id);
    } catch (e: unknown) {
      setCancelError((e as Error).message ?? 'No se pudo cancelar.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow:
          '0 4px 6px -1px rgba(0,0,0,0.15), 0 2px 4px -1px rgba(0,0,0,0.08)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={e =>
        ((e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)')
      }
      onMouseLeave={e =>
        ((e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)')
      }
    >
      {/* ── Banner superior ────────────────────────────────────── */}
      <div
        style={{
          background: ticket.estado === 'Activo' ? '#6366f1' : 'rgba(100,116,139,0.4)',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3
          style={{
            margin: 0,
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}
        >
          {ticket.ruta_codigo ?? `BUS-${ticket.programacion_id?.slice(0, 4).toUpperCase() ?? 'TR'}`}
        </h3>
        <span
          style={{
            background: estadoColors.bg,
            color: estadoColors.text,
            padding: '0.2rem 0.7rem',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {ESTADO_LABEL[ticket.estado]}
        </span>
      </div>

      {/* ── Detalles ───────────────────────────────────────────── */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Origen → Destino */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Origen
            </p>
            <p style={{ margin: '0.2rem 0 0', fontWeight: 600, fontSize: '0.95rem' }}>
              {ticket.origen_nombre ?? 'Paradero de abordaje'}
            </p>
          </div>

          {/* Flecha */}
          <span style={{ color: '#475569', fontSize: '1rem', marginBottom: '2px' }}>→</span>

          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Destino
            </p>
            <p
              style={{
                margin: '0.2rem 0 0',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: ticket.destino_nombre ? 'inherit' : '#64748b',
                fontStyle: ticket.destino_nombre ? 'normal' : 'italic',
              }}
            >
              {ticket.destino_nombre ?? 'En tránsito…'}
            </p>
          </div>
        </div>

        {/* Separador con nombre de ruta */}
        {ticket.ruta_nombre && (
          <p
            style={{
              margin: 0,
              fontSize: '0.75rem',
              color: '#475569',
              textAlign: 'center',
              borderTop: '1px dashed rgba(255,255,255,0.07)',
              paddingTop: '0.75rem',
            }}
          >
            {ticket.ruta_nombre}
          </p>
        )}

        {/* Fecha + Tarifa */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px dashed rgba(255,255,255,0.07)',
            paddingTop: '0.75rem',
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Abordaje
            </p>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', fontWeight: 600 }}>{boardingStr}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Monto Pagado
            </p>
            <p style={{ margin: '0.2rem 0 0', fontSize: '1.05rem', fontWeight: 700, color: '#34d399' }}>
              {priceStr}
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
           <span style={{ fontSize: '0.7rem', color: '#475569' }}>Emisión: {dateStr}</span>
           {ticket.tolerancia_minutos && (
             <span style={{ fontSize: '0.7rem', color: '#facc15' }}>Tol: {ticket.tolerancia_minutos}m</span>
           )}
        </div>
      </div>

      {/* ── Área QR ────────────────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(0,0,0,0.18)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          gap: '0.75rem',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
          Presenta este código al abordar el bus.
        </p>
        <TicketQR value={ticket.qr_code} />
        <span
          style={{
            fontSize: '0.65rem',
            color: '#475569',
            letterSpacing: '2px',
            fontFamily: 'monospace',
          }}
        >
          {ticket.id.toUpperCase().slice(0, 8)}
        </span>
      </div>

      {/* ── Acción de cancelación (opcional) ──────────────────── */}
      {onCancel && ticket.estado === 'Activo' && (
        <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {cancelError && (
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#ef4444', textAlign: 'center' }}>
              {cancelError}
            </p>
          )}
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            style={{
              width: '100%',
              padding: '0.6rem',
              background: 'rgba(239,68,68,0.08)',
              color: cancelling ? '#64748b' : '#ef4444',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '0.5rem',
              cursor: cancelling ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!cancelling) (e.currentTarget.style.background = 'rgba(239,68,68,0.15)'); }}
            onMouseLeave={e => { (e.currentTarget.style.background = 'rgba(239,68,68,0.08)'); }}
          >
            {cancelling ? 'Cancelando…' : 'Cancelar boleto'}
          </button>
        </div>
      )}
    </div>
  );
};