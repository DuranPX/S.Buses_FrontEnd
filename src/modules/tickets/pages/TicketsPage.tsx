// ================================================================
// TicketsPage.tsx — Módulo Boletos
// Lista de boletos ACTIVOS del ciudadano autenticado.
// Integrado con:
//   - HU-ENTR-2-003 (Abordaje y generación de boleto)
//   - HU-004        (Descenso / Finalizar viaje)
// ================================================================

import { useState, useEffect } from 'react';
import { useTickets } from '../hooks/useTickets';
import { TicketCard } from '../components/TicketCard';
import { Loader } from '../../../shared/components/ui/Loader';
import { useNavigate } from 'react-router-dom';
import { businessApi } from '../../../api/api';
import { useSocket } from '../../../websocket/hooks/useSocket';
import { WS_EVENTS } from '../../../websocket/events';
import type { Ticket } from '../types/ticket.types';

// ── Tipos ────────────────────────────────────────────────────────

interface Paradero {
    id: string;
    nombre: string;
    codigo?: string;
}

// ── Helpers de UI ────────────────────────────────────────────────

const selectItemStyle = (active: boolean): React.CSSProperties => ({
    width: '100%',
    background: active ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
    border: `1.5px solid ${active ? '#6366f1' : 'rgba(255,255,255,0.07)'}`,
    borderRadius: '0.75rem',
    padding: '0.875rem 1rem',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'inherit',
    transition: 'border-color 0.15s, background 0.15s',
});

// ── Modal: Seleccionar paradero de descenso ──────────────────────

const ModalDescenso = ({
    ticket,
    onConfirm,
    onClose,
}: {
    ticket: Ticket;
    onConfirm: (paraderoId: string) => Promise<void>;
    onClose: () => void;
}) => {
    const [paraderos, setParaderos] = useState<Paradero[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        businessApi
            .get<Paradero[]>('/paraderos')
            .then(res => setParaderos(res.data))
            .catch(e => setError(e?.response?.data?.message || e.message))
            .finally(() => setLoading(false));
    }, []);

    const handleConfirm = async () => {
        if (!selected) return;
        setSubmitting(true);
        setError('');
        try {
            await onConfirm(selected);
            setSuccess(true);
        } catch (e: any) {
            setError(e?.response?.data?.message || e.message || 'Error al registrar el descenso.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        /* ── Overlay ── */
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* ── Panel ── */}
            <div
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}
            >
                {success ? (
                    /* ── Estado éxito ── */
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', color: '#34d399' }}>
                            ✓
                        </div>
                        <h3 style={{ margin: 0, color: '#34d399', fontWeight: 800, fontSize: '1.2rem' }}>
                            ¡Viaje finalizado!
                        </h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                            Tu descenso fue registrado correctamente.
                        </p>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ marginTop: '0.5rem', padding: '0.75rem 2rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}
                        >
                            Cerrar
                        </button>
                    </div>
                ) : (
                    <>
                        {/* ── Encabezado ── */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.25rem', fontWeight: 700, fontSize: '1.1rem', color: '#f8fafc' }}>
                                    Finalizar viaje
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                                    Boleto: <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{ticket.id.slice(0, 8).toUpperCase()}</span>
                                    {ticket.ruta_codigo && (
                                        <> · Ruta <strong style={{ color: '#a5b4fc' }}>{ticket.ruta_codigo}</strong></>
                                    )}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, padding: '0.1rem 0.35rem' }}
                                aria-label="Cerrar"
                            >
                                ×
                            </button>
                        </div>

                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
                            Selecciona el paradero donde estás bajando.
                        </p>

                        {/* ── Error ── */}
                        {error && (
                            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.625rem', padding: '0.65rem 1rem', color: '#fca5a5', fontSize: '0.83rem' }}>
                                {error}
                            </div>
                        )}

                        {/* ── Lista paraderos ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '260px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                            {loading && (
                                <p style={{ color: '#334155', textAlign: 'center', padding: '1rem', margin: 0 }}>
                                    Cargando paraderos…
                                </p>
                            )}
                            {!loading && paraderos.length === 0 && !error && (
                                <p style={{ color: '#475569', textAlign: 'center', padding: '1rem', margin: 0, fontSize: '0.85rem' }}>
                                    No hay paraderos disponibles.
                                </p>
                            )}
                            {paraderos.map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    style={selectItemStyle(selected === p.id)}
                                    onClick={() => setSelected(p.id)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.nombre}</span>
                                        {p.codigo && (
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#475569', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.5rem', borderRadius: '0.35rem' }}>
                                                {p.codigo}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* ── Acciones ── */}
                        <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.25rem' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{ flex: 1, padding: '0.825rem', background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={!selected || submitting}
                                onClick={handleConfirm}
                                style={{
                                    flex: 2,
                                    padding: '0.825rem',
                                    background: !selected || submitting ? 'rgba(99,102,241,0.3)' : '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    fontWeight: 700,
                                    cursor: !selected || submitting ? 'not-allowed' : 'pointer',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                {submitting ? (
                                    <>
                                        <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                                        Registrando…
                                    </>
                                ) : (
                                    'Confirmar descenso'
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// ================================================================
// COMPONENTE PRINCIPAL: TicketsPage
// ================================================================

const TicketsPage = () => {
    const { tickets, isLoading, error, refetch, cancelTicket } = useTickets();
    const navigate = useNavigate();

    // ── Estado del modal de descenso ─────────────────────────────
    const [ticketParaDescenso, setTicketParaDescenso] = useState<Ticket | null>(null);

    // ── Handler: registrar descenso vía PATCH /:id/descenso ──────
    const handleDescenso = async (paraderoDescensoId: string) => {
        if (!ticketParaDescenso) return;
        await businessApi.patch(`/boletos/${ticketParaDescenso.id}/descenso`, {
            paraderoDescensoId,
        });
        // Refrescamos la lista tras el descenso exitoso
        await refetch();
    };

    // ── WebSocket: Escuchar eventos de descenso en tiempo real ────
    useSocket<{ boletoId: string; estado: string }>(
        WS_EVENTS.PASSENGER_DESCENDED,
        (_data) => {
            // Refresca la lista de boletos cuando otro cliente descienda
            // Esto mantiene la información sincronizada entre usuarios
            refetch().catch(err => console.warn('Refetch en WS PASSENGER_DESCENDED falló:', err));
        }
    );

    return (
        <>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            {/* ── Modal de descenso (condicional) ─────────────────── */}
            {ticketParaDescenso && (
                <ModalDescenso
                    ticket={ticketParaDescenso}
                    onConfirm={handleDescenso}
                    onClose={() => setTicketParaDescenso(null)}
                />
            )}

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
                {/* ── Header ──────────────────────────────────────────── */}
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
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.4rem', color: '#f8fafc' }}>
                            Mis Boletos
                        </h1>
                        <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
                            Gestiona tus boletos activos y registra nuevos abordajes.
                        </p>
                    </div>

                    {/* ── Acciones ──────────────────────────────────── */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            type="button"
                            onClick={refetch}
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '0.55rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '0.85rem' }}
                            title="Actualizar lista"
                        >
                            ↻
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/abordaje')}
                            style={{ background: '#6366f1', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(99,102,241,0.25)' }}
                        >
                            + Abordar bus
                        </button>
                    </div>
                </div>

                {/* ── Contenido principal ──────────────────────────────── */}
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
                        <Loader />
                    </div>

                ) : error ? (
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '1.25rem', borderRadius: '0.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={refetch}
                            style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                        >
                            Reintentar
                        </button>
                    </div>

                ) : tickets.length === 0 ? (
                    /* ── Estado vacío ──────────────────────────────── */
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '2.5rem' }}>🚌</span>
                        <h3 style={{ margin: 0, color: '#f8fafc', fontWeight: 600 }}>
                            No tienes boletos activos
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>
                            Realiza un abordaje para generar tu primer boleto.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button
                                type="button"
                                onClick={() => navigate('/abordaje')}
                                style={{ background: '#10b981', color: 'white', padding: '0.65rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Abordar bus
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/rutas')}
                                style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', padding: '0.65rem 1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Ver rutas
                            </button>
                        </div>
                    </div>

                ) : (
                    /* ── Grid de boletos ────────────────────────────── */
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', paddingBottom: '2rem' }}>
                        {tickets.map(ticket => (
                            <div key={ticket.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                <TicketCard
                                    ticket={ticket}
                                    onCancel={cancelTicket}
                                />

                                {/* ── Botón Finalizar viaje (solo boletos ACTIVO) ── */}
                                {ticket.estado === 'Activo' && (
                                    <button
                                        type="button"
                                        onClick={() => setTicketParaDescenso(ticket)}
                                        style={{
                                            width: '100%',
                                            padding: '0.7rem',
                                            background: 'rgba(16,185,129,0.1)',
                                            color: '#34d399',
                                            border: '1px solid rgba(52,211,153,0.25)',
                                            borderRadius: '0.75rem',
                                            cursor: 'pointer',
                                            fontWeight: 700,
                                            fontSize: '0.875rem',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.18)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.1)')}
                                    >
                                        Finalizar viaje
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default TicketsPage;