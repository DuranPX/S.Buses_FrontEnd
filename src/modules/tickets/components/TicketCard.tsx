import type { Ticket } from '../types/ticket.types';
import { TicketQR } from './TicketQR';

interface Props {
  ticket: Ticket;
}

export const TicketCard = ({ ticket }: Props) => {
  const date = ticket.fecha_emision ? new Date(ticket.fecha_emision) : null;
  const dateStr = date && !isNaN(date.getTime()) 
    ? date.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'Fecha no disponible';

  const priceStr = typeof ticket.tarifa_pagada === 'number'
    ? `$${ticket.tarifa_pagada.toLocaleString('es-CO')}`
    : '---';

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '1rem',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      {/* Top Banner */}
      <div style={{ background: '#6366f1', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: 700 }}>
          {ticket.ruta_codigo || 'RUTA'}
        </h3>
        <span style={{ background: 'white', color: '#6366f1', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
          {ticket.estado}
        </span>
      </div>

      {/* Details */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Origen</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{ticket.origen_nombre || 'Paradero Origen'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Destino</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{ticket.destino_nombre || 'En tránsito...'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Fecha de Compra</p>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>{dateStr}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Tarifa Pagada</p>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>
              {priceStr}
            </p>
          </div>
        </div>
      </div>

      {/* QR Code Area */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
          Presenta este QR al abordar el bus para iniciar tu viaje.
        </p>
        <TicketQR value={ticket.qr_code} />
        <span style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#64748b', letterSpacing: '2px' }}>
          {ticket.id.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
