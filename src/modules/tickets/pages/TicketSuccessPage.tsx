// ================================================================
// TicketSuccessPage.tsx — Módulo Boletos
// Pantalla de confirmación tras una compra exitosa.
//
// Espera el state de navigate() con esta forma:
//   navigate('/boletos/exito', {
//     state: { success: true, ticket: Ticket, saldoRestante: number | null }
//   });
// ================================================================

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Ticket } from '../types/ticket.types';

interface SuccessState {
  success: boolean;
  ticket: Ticket;
  saldoRestante?: number | null;
}

const TicketSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SuccessState | null;

  useEffect(() => {
    if (!state?.success) {
      navigate('/rutas', { replace: true });
    }
  }, [state, navigate]);

  if (!state?.success) return null;

  const { ticket, saldoRestante } = state;

  const dateStr = ticket?.fecha_emision
    ? new Date(ticket.fecha_emision).toLocaleString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  const tarifaStr =
    typeof ticket?.tarifa_pagada === 'number'
      ? `$${ticket.tarifa_pagada.toLocaleString('es-CO')}`
      : '—';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.18)',
          borderRadius: '1.25rem',
          padding: '3rem 2rem',
          maxWidth: '480px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* Icono ✓ */}
        <div
          style={{
            width: '80px',
            height: '80px',
            background: '#10b981',
            color: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            boxShadow: '0 0 24px rgba(16,185,129,0.35)',
          }}
          role="img"
          aria-label="Compra exitosa"
        >
          ✓
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              margin: '0 0 0.5rem',
              color: '#f8fafc',
            }}
          >
            ¡Abordaje exitoso!
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>
            Tu boleto fue generado y el pago procesado correctamente.
            Presenta el código QR al conductor.
          </p>
        </div>

        {/* Saldo restante (solo tarjeta prepago) */}
        {saldoRestante != null && (
          <div
            style={{
              width: '100%',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '0.75rem',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Saldo restante
            </p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '2rem', fontWeight: 700, color: '#34d399' }}>
              ${saldoRestante.toLocaleString('es-CO')}
            </p>
          </div>
        )}

        {/* Resumen del boleto */}
        {ticket && (
          <div
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '0.75rem',
              overflow: 'hidden',
            }}
          >
            {[
              ['Ruta', ticket.ruta_codigo ?? '—'],
              ['Origen', ticket.origen_nombre ?? '—'],
              ['Tarifa', tarifaStr],
              ['Emitido', dateStr],
              ['ID Boleto', ticket.id.toUpperCase().slice(0, 8)],
            ].map(([label, value], i, arr) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.7rem 1rem',
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  fontSize: '0.875rem',
                }}
              >
                <span style={{ color: '#64748b' }}>{label}</span>
                <span
                  style={{
                    fontWeight: 600,
                    fontFamily: label === 'ID Boleto' ? 'monospace' : 'inherit',
                    color: label === 'Tarifa' ? '#34d399' : '#f1f5f9',
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          <button
            type="button"
            onClick={() => navigate('/boletos')}
            style={{
              flex: 1,
              background: '#6366f1',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.6rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Ver mis boletos
          </button>
          <button
            type="button"
            onClick={() => navigate('/paraderos')}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.75rem',
              borderRadius: '0.6rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            Ver paraderos
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketSuccessPage;