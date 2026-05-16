// ================================================================
// TicketsPage.tsx — Módulo Boletos
// Lista de boletos ACTIVOS del ciudadano autenticado.
// Integrado con flujo HU-ENTR-2-003 (Abordaje y generación de boleto)
// ================================================================

import { useTickets } from '../hooks/useTickets';
import { TicketCard } from '../components/TicketCard';
import { Loader } from '../../../shared/components/ui/Loader';
import { useNavigate } from 'react-router-dom';

const TicketsPage = () => {
  const { tickets, isLoading, error, refetch, cancelTicket } = useTickets();
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: '1.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        style={{
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.8rem',
              fontWeight: 700,
              marginBottom: '0.4rem',
              color: '#f8fafc',
            }}
          >
            Mis Boletos
          </h1>

          <p
            style={{
              color: '#64748b',
              margin: 0,
              fontSize: '0.9rem',
            }}
          >
            Gestiona tus boletos activos y registra nuevos abordajes.
          </p>
        </div>

        {/* ── Acciones ───────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {/* Refresh */}
          <button
            type="button"
            onClick={refetch}
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#94a3b8',
              padding: '0.55rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
            title="Actualizar lista"
          >
            ↻
          </button>

          {/* Nuevo abordaje */}
          <button
            type="button"
            onClick={() => navigate('/abordaje')}
            style={{
              background: '#6366f1',
              color: 'white',
              padding: '0.6rem 1.25rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              boxShadow: '0 4px 14px rgba(99,102,241,0.25)',
            }}
          >
            + Abordar bus
          </button>
        </div>
      </div>

      {/* ── Contenido principal ───────────────────────────────── */}
      {isLoading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            minHeight: '300px',
          }}
        >
          <Loader />
        </div>
      ) : error ? (
        <div
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444',
            padding: '1.25rem',
            borderRadius: '0.75rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={refetch}
            style={{
              background: 'rgba(239,68,68,0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.3)',
              padding: '0.5rem 1.25rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Reintentar
          </button>
        </div>
      ) : tickets.length === 0 ? (
        /* ── Estado vacío ───────────────────────────────────── */
        <div
          style={{
            textAlign: 'center',
            color: '#64748b',
            padding: '4rem 1rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '1rem',
            border: '1px dashed rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '2.5rem' }}>🚌</span>

          <h3
            style={{
              margin: 0,
              color: '#f8fafc',
              fontWeight: 600,
            }}
          >
            No tienes boletos activos
          </h3>

          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Realiza un abordaje para generar tu primer boleto.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '0.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {/* CTA principal */}
            <button
              type="button"
              onClick={() => navigate('/abordaje')}
              style={{
                background: '#10b981',
                color: 'white',
                padding: '0.65rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Abordar bus
            </button>

            {/* CTA secundario */}
            <button
              type="button"
              onClick={() => navigate('/rutas')}
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: '#94a3b8',
                padding: '0.65rem 1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Ver rutas
            </button>
          </div>
        </div>
      ) : (
        /* ── Grid de boletos ───────────────────────────────── */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
            paddingBottom: '2rem',
          }}
        >
          {tickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onCancel={cancelTicket}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketsPage;