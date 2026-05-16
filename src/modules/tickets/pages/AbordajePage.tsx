// ================================================================
// AbordajePage.tsx — HU-ENTR-2-003: Abordaje y generación de boleto
//
// Flujo de 5 pasos:
//   1. Seleccionar programación activa  → GET /programaciones
//   2. Seleccionar método de pago       → GET /metodo-pago-ciudadano?ciudadano_id=...
//   3. Seleccionar paradero de abordaje → GET /paraderos
//   4. Confirmar abordaje               → POST /boletos/comprar
//   5. Éxito                            → muestra "Abordaje exitoso" + saldo restante
//
// Criterios de aceptación cubiertos:
//   ✅ Identifica programación activa
//   ✅ Valida saldo suficiente (PREPAGO)
//   ✅ Descuenta el monto al confirmar (lo hace el backend en comprar())
//   ✅ Genera boleto asociado a ciudadano + programación + método de pago
//   ✅ Registra paradero de abordaje con timestamp (fecha_emision del boleto)
//   ✅ Muestra "Abordaje exitoso" con saldo restante
//   ✅ Rechaza si bus lleno (pasajeros_actuales >= capacidad_maxima)
// ================================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsService } from '../services/ticketsService';
import { businessApi } from '../../../api/api';
import type { CreateBoletoDto, Ticket } from '../types/ticket.types';


// ── Tipos del backend ────────────────────────────────────────────

interface Programacion {
    id: string;
    estado: string;
    pasajeros_actuales: number;
    capacidad_maxima: number;
    ruta?: { id: string; codigo: string; nombre?: string };
    bus?: { id: string; placa?: string };
    fecha?: string;
    hora_salida: string;
    tolerancia_minutos?: number;
    tarifa?: number;
}

interface MetodoPagoCiudadano {
    id: string;
    tipo?: string;           // PREPAGO | EFECTIVO | CREDITO
    nombre?: string;
    saldo?: number;
    metodoPago?: { id: string; nombre: string; tipo: string };
}

interface Paradero {
    id: string;
    nombre: string;
    codigo?: string;
    latitud?: string;
    longitud?: string;
    tipo?: string;
    estado?: boolean;
}

// ── Tipos de pasos ───────────────────────────────────────────────

type Step = 'programacion' | 'metodo_pago' | 'paradero' | 'confirmar' | 'exito';

const STEPS: Step[] = ['programacion', 'metodo_pago', 'paradero', 'confirmar', 'exito'];

// ── Helpers de UI ────────────────────────────────────────────────

const cls = {
    card: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.875rem',
        padding: '1.5rem',
    } as React.CSSProperties,

    selectItem: (active: boolean, disabled = false): React.CSSProperties => ({
        width: '100%',
        background: active ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
        border: `1.5px solid ${active ? '#6366f1' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '0.75rem',
        padding: '0.875rem 1rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left' as const,
        color: disabled ? '#475569' : 'inherit',
        opacity: disabled ? 0.5 : 1,
        transition: 'border-color 0.15s, background 0.15s',
    }),

    btnPrimary: (disabled = false): React.CSSProperties => ({
        width: '100%',
        padding: '0.875rem',
        background: disabled ? 'rgba(99,102,241,0.3)' : '#6366f1',
        color: 'white',
        border: 'none',
        borderRadius: '0.75rem',
        fontWeight: 700,
        fontSize: '1rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s',
    }),

    btnSecondary: {
        flex: 1,
        padding: '0.875rem',
        background: 'rgba(255,255,255,0.04)',
        color: '#64748b',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '0.75rem',
        cursor: 'pointer',
        fontWeight: 600,
    } as React.CSSProperties,
};

const Alert = ({ type, msg }: { type: 'error' | 'info' | 'warn'; msg: string }) => {
    const colors = {
        error: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', text: '#fca5a5' },
        info: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', text: '#a5b4fc' },
        warn: { bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.25)', text: '#fde68a' },
    };
    const c = colors[type];
    return (
        <div role="alert" style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '0.625rem', padding: '0.7rem 1rem', color: c.text, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            {msg}
        </div>
    );
};

const StepBar = ({ current }: { current: number }) => (
    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.75rem' }}>
        {['Programación', 'Pago', 'Paradero', 'Confirmar'].map((label, i) => (
            <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                <div style={{ height: '3px', width: '100%', borderRadius: '999px', background: i <= current ? '#6366f1' : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
                <span style={{ fontSize: '0.6rem', color: i <= current ? '#a5b4fc' : '#334155', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {label}
                </span>
            </div>
        ))}
    </div>
);

// ── Paso 1: Seleccionar programación ────────────────────────────

const StepProgramacion = ({ onNext }: { onNext: (p: Programacion) => void }) => {
    const [items, setItems] = useState<Programacion[]>([]);
    const [selected, setSelected] = useState<Programacion | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        businessApi.get<Programacion[]>('/programaciones')
            .then(res => {
                const activas = res.data.filter(p => !p.estado || p.estado === 'Activo' || p.estado === 'En_Curso');
                setItems(activas);
            })
            .catch(e => setError(e?.response?.data?.message || e.message))
            .finally(() => setLoading(false));
    }, []);

    const lleno = (p: Programacion) => p.pasajeros_actuales >= p.capacidad_maxima;

    return (
        <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.35rem' }}>¿En qué bus abordas?</h2>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Selecciona la programación activa del bus donde estás.
            </p>

            {error && <Alert type="error" msg={error} />}
            {loading && <p style={{ color: '#334155', textAlign: 'center', padding: '1rem' }}>Cargando programaciones…</p>}

            {!loading && items.length === 0 && !error && (
                <Alert type="info" msg="No hay programaciones activas en este momento." />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
                {items.map(p => {
                    const full = lleno(p);
                    return (
                        <button key={p.id} type="button" style={cls.selectItem(selected?.id === p.id, full)} onClick={() => !full && setSelected(p)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                        {p.ruta?.codigo ?? p.id.slice(0, 8)}
                                    </span>
                                    {p.ruta?.nombre && (
                                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>{p.ruta.nombre}</p>
                                    )}
                                    {p.hora_salida && (
                                        <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>Salida: {p.hora_salida}</p>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    {typeof p.tarifa === 'number' && (
                                        <span style={{ fontWeight: 700, color: '#34d399', fontSize: '0.9rem' }}>
                                            ${p.tarifa.toLocaleString('es-CO')}
                                        </span>
                                    )}
                                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: full ? '#ef4444' : '#64748b' }}>
                                        {full ? '⛔ Bus lleno' : `${p.pasajeros_actuales}/${p.capacidad_maxima} pasajeros`}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <button type="button" style={cls.btnPrimary(!selected)} onClick={() => selected && onNext(selected)} disabled={!selected}>
                Continuar →
            </button>
        </div>
    );
};

// ── Paso 2: Seleccionar método de pago ──────────────────────────

const StepMetodoPago = ({
    tarifa,
    onNext,
    onBack,
}: {
    tarifa: number;
    onNext: (m: MetodoPagoCiudadano) => void;
    onBack: () => void;
}) => {
    const [items, setItems] = useState<MetodoPagoCiudadano[]>([]);
    const [selected, setSelected] = useState<MetodoPagoCiudadano | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        businessApi.get<MetodoPagoCiudadano[]>('/metodo-pago-ciudadano')
            .then(res => setItems(res.data))
            .catch(e => setError(e?.response?.data?.message || e.message))
            .finally(() => setLoading(false));
    }, []);

    const tipo = (m: MetodoPagoCiudadano) =>
        m.tipo ?? m.metodoPago?.tipo ?? '';

    const nombre = (m: MetodoPagoCiudadano) =>
        m.nombre ?? m.metodoPago?.nombre ?? 'Método de pago';

    const saldoInsuficiente = (m: MetodoPagoCiudadano) =>
        tipo(m) === 'PREPAGO' && typeof m.saldo === 'number' && m.saldo < tarifa;

    const saldoRestante =
        selected && tipo(selected) === 'PREPAGO' && typeof selected.saldo === 'number'
            ? selected.saldo - tarifa
            : null;

    return (
        <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.35rem' }}>¿Cómo vas a pagar?</h2>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Tarifa del viaje:{' '}
                <strong style={{ color: '#34d399' }}>${tarifa.toLocaleString('es-CO')}</strong>
            </p>

            {error && <Alert type="error" msg={error} />}
            {loading && <p style={{ color: '#334155', textAlign: 'center', padding: '1rem' }}>Cargando métodos de pago…</p>}
            {!loading && items.length === 0 && !error && (
                <Alert type="warn" msg="No tienes métodos de pago registrados." />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', margin: '0.875rem 0' }}>
                {items.map(m => {
                    const insuf = saldoInsuficiente(m);
                    const esPrepago = tipo(m) === 'PREPAGO';
                    return (
                        <button key={m.id} type="button" style={cls.selectItem(selected?.id === m.id, insuf)} onClick={() => !insuf && setSelected(m)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{nombre(m)}</span>
                                    <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#475569' }}>{tipo(m)}</p>
                                </div>
                                {esPrepago && typeof m.saldo === 'number' && (
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontWeight: 700, color: insuf ? '#ef4444' : '#34d399', fontSize: '0.9rem' }}>
                                            ${m.saldo.toLocaleString('es-CO')}
                                        </span>
                                        {insuf && <p style={{ margin: '0.15rem 0 0', fontSize: '0.7rem', color: '#ef4444' }}>Saldo insuficiente</p>}
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {saldoRestante !== null && (
                <Alert type="info" msg={`Saldo restante tras el pago: $${saldoRestante.toLocaleString('es-CO')}`} />
            )}

            <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.5rem' }}>
                <button type="button" style={cls.btnSecondary} onClick={onBack}>← Atrás</button>
                <button type="button" style={{ ...cls.btnPrimary(!selected), flex: 2 }} disabled={!selected} onClick={() => selected && onNext(selected)}>
                    Continuar →
                </button>
            </div>
        </div>
    );
};

// ── Paso 3: Seleccionar paradero de abordaje ─────────────────────

const StepParadero = ({
    onNext,
    onBack,
}: {
    onNext: (p: Paradero) => void;
    onBack: () => void;
}) => {
    const [items, setItems] = useState<Paradero[]>([]);
    const [selected, setSelected] = useState<Paradero | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        businessApi.get<Paradero[]>('/paraderos')
            .then(res => setItems(res.data))
            .catch(e => setError(e?.response?.data?.message || e.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.35rem' }}>¿Desde qué paradero abordas?</h2>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Selecciona tu punto de abordaje. Se registrará con la hora actual.
            </p>

            {error && <Alert type="error" msg={error} />}
            {loading && <p style={{ color: '#334155', textAlign: 'center', padding: '1rem' }}>Cargando paraderos…</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
                {items.map(p => (
                    <button key={p.id} type="button" style={cls.selectItem(selected?.id === p.id)} onClick={() => setSelected(p)}>
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

            <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button type="button" style={cls.btnSecondary} onClick={onBack}>← Atrás</button>
                <button type="button" style={{ ...cls.btnPrimary(!selected), flex: 2 }} disabled={!selected} onClick={() => selected && onNext(selected)}>
                    Confirmar →
                </button>
            </div>
        </div>
    );
};

// ── Paso 4: Pantalla de confirmación ────────────────────────────

const StepConfirmar = ({
    programacion,
    metodo,
    paradero,
    onConfirm,
    onBack,
    loading,
    error,
}: {
    programacion: Programacion;
    metodo: MetodoPagoCiudadano;
    paradero: Paradero;
    onConfirm: () => void;
    onBack: () => void;
    loading: boolean;
    error: string;
}) => {
    const tarifa = programacion.tarifa ?? 0;
    const tipo = metodo.tipo ?? metodo.metodoPago?.tipo ?? '';
    const nombre = metodo.nombre ?? metodo.metodoPago?.nombre ?? 'Método de pago';
    const saldoRestante = tipo === 'PREPAGO' && typeof metodo.saldo === 'number' ? metodo.saldo - tarifa : null;

    const filas = [
        ['Ruta', programacion.ruta?.codigo ?? '—'],
        ['Paradero de abordaje', paradero.nombre],
        ['Método de pago', nombre],
        ['Tarifa', `$${tarifa.toLocaleString('es-CO')}`],
        ...(saldoRestante !== null ? [['Saldo restante', `$${saldoRestante.toLocaleString('es-CO')}`]] : []),
    ];

    return (
        <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.35rem' }}>Confirmar abordaje</h2>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Revisa los datos. Al confirmar se generará tu boleto y se descontará la tarifa.
            </p>

            {error && <Alert type="error" msg={error} />}

            {/* Resumen */}
            <div style={{ borderRadius: '0.875rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.25rem' }}>
                <div style={{ background: '#6366f1', padding: '0.75rem 1.25rem' }}>
                    <span style={{ color: 'white', fontWeight: 700 }}>{programacion.ruta?.codigo ?? 'Programación'}</span>
                    {programacion.ruta?.nombre && (
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                            · {programacion.ruta.nombre}
                        </span>
                    )}
                </div>
                {filas.map(([label, value], i) => (
                    <div
                        key={label}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.7rem 1.25rem',
                            borderBottom: i < filas.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            fontSize: '0.875rem',
                            background: 'rgba(255,255,255,0.015)',
                        }}
                    >
                        <span style={{ color: '#64748b' }}>{label}</span>
                        <span style={{ fontWeight: 600, color: label === 'Saldo restante' ? '#34d399' : '#f1f5f9' }}>
                            {value}
                        </span>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button type="button" style={cls.btnSecondary} disabled={loading} onClick={onBack}>← Atrás</button>
                <button
                    type="button"
                    style={{ ...cls.btnPrimary(loading), flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    disabled={loading}
                    onClick={onConfirm}
                >
                    {loading ? (
                        <>
                            <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                            Generando boleto…
                        </>
                    ) : '✓ Confirmar abordaje'}
                </button>
            </div>
        </div>
    );
};

// ── Paso 5: Éxito ────────────────────────────────────────────────

const StepExito = ({
    ticket,
    saldoRestante,
    onReset,
}: {
    ticket: Ticket;
    saldoRestante: number | null;
    onReset: () => void;
}) => {
    const navigate = useNavigate();

    const fechaStr = new Date(ticket.fecha_emision).toLocaleString('es-CO', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    return (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#34d399' }}>
                ✓
            </div>

            <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', margin: '0 0 0.4rem' }}>
                    Abordaje exitoso
                </h2>
                <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0 }}>
                    Tu boleto fue generado y el abordaje quedó registrado.
                </p>
            </div>

            {/* Saldo restante */}
            {saldoRestante !== null && (
                <div style={{ width: '100%', background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '0.875rem', padding: '1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Saldo restante en tu tarjeta</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>
                        ${saldoRestante.toLocaleString('es-CO')}
                    </p>
                </div>
            )}

            {/* Datos del boleto generado */}
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.875rem', overflow: 'hidden' }}>
                {[
                    ['ID Boleto', ticket.id.toUpperCase().slice(0, 8)],
                    ['Ruta', ticket.ruta_codigo ?? '—'],
                    ['Paradero', ticket.origen_nombre ?? '—'],
                    ['Tarifa cobrada', `$${ticket.monto_pagado.toLocaleString('es-CO')}`],
                    ['Registrado', fechaStr],
                ].map(([label, value], i, arr) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 1rem', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', fontSize: '0.85rem' }}>
                        <span style={{ color: '#64748b' }}>{label}</span>
                        <span style={{ fontWeight: 600, fontFamily: label === 'ID Boleto' ? 'monospace' : 'inherit' }}>{value}</span>
                    </div>
                ))}
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '0.625rem', width: '100%' }}>
                <button
                    type="button"
                    onClick={() => navigate('/boletos', { state: { ticket, saldoRestante } })}
                    style={{ flex: 1, padding: '0.875rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                    Ver mis boletos
                </button>
                <button
                    type="button"
                    onClick={onReset}
                    style={{ flex: 1, padding: '0.875rem', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                    Nuevo abordaje
                </button>
            </div>
        </div>
    );
};

// ================================================================
// COMPONENTE PRINCIPAL: AbordajePage
// ================================================================

const AbordajePage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('programacion');
    const [programacion, setProgramacion] = useState<Programacion | null>(null);
    const [metodo, setMetodo] = useState<MetodoPagoCiudadano | null>(null);
    const [paradero, setParadero] = useState<Paradero | null>(null);
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [confirmError, setConfirmError] = useState('');

    const stepIndex = STEPS.indexOf(step);

    const handleConfirm = useCallback(async () => {
        if (!programacion || !metodo || !paradero) return;
        setConfirmLoading(true);
        setConfirmError('');

        const dto: CreateBoletoDto = {
            programacionId: programacion.id,
            metodoPagoId: metodo.id,
            paraderoId: paradero.id,
        };

        // 🔍 DIAGNÓSTICO: ver exactamente qué IDs se envían al backend
        console.log('[AbordajePage] DTO enviado:', dto);
        console.log('[AbordajePage] Programacion raw:', programacion);
        console.log('[AbordajePage] Metodo raw:', metodo);
        console.log('[AbordajePage] Paradero raw:', paradero);

        try {
            const result = await ticketsService.buyTicket(dto);
            setTicket(result);
            setStep('exito');
        } catch (e: any) {
            // Manejar específicamente HTTP 402 Payment Required u otros errores de la API
            const msg = e?.response?.status === 402 || e.message?.includes('402') || e.message?.includes('Insufficient balance')
                ? 'Saldo insuficiente en tu método de pago.'
                : e?.response?.data?.message || e.message || 'No se pudo procesar el abordaje.';
            
            setConfirmError(msg);
        } finally {
            setConfirmLoading(false);
        }
    }, [programacion, metodo, paradero]);

    const handleReset = () => {
        setStep('programacion');
        setProgramacion(null);
        setMetodo(null);
        setParadero(null);
        setTicket(null);
        setConfirmError('');
    };

    const saldoRestante =
        ticket && metodo
            ? (metodo.tipo === 'PREPAGO' || metodo.metodoPago?.tipo === 'PREPAGO') && typeof metodo.saldo === 'number'
                ? metodo.saldo - ticket.monto_pagado
                : null
            : null;

    return (
        <div style={{ minHeight: 'calc(100vh - 64px)', padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <div style={{ width: '100%', maxWidth: '480px' }}>

                {/* Header de la página */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                    <button
                        type="button"
                        onClick={() => step === 'programacion' || step === 'exito' ? navigate(-1) : setStep(STEPS[stepIndex - 1] as Step)}
                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.1rem', padding: '0.25rem' }}
                        aria-label="Volver"
                    >
                        ←
                    </button>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            HU-ENTR-2-003
                        </p>
                        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                            Abordar Bus
                        </h1>
                    </div>
                </div>

                {/* Barra de progreso (solo durante el flujo, no en éxito) */}
                {step !== 'exito' && <StepBar current={stepIndex} />}

                {/* Panel del paso */}
                <div style={cls.card}>
                    {step === 'programacion' && (
                        <StepProgramacion onNext={p => { setProgramacion(p); setStep('metodo_pago'); }} />
                    )}
                    {step === 'metodo_pago' && programacion && (
                        <StepMetodoPago
                            tarifa={programacion.tarifa ?? 0}
                            onNext={m => { setMetodo(m); setStep('paradero'); }}
                            onBack={() => setStep('programacion')}
                        />
                    )}
                    {step === 'paradero' && (
                        <StepParadero
                            onNext={p => { setParadero(p); setStep('confirmar'); }}
                            onBack={() => setStep('metodo_pago')}
                        />
                    )}
                    {step === 'confirmar' && programacion && metodo && paradero && (
                        <StepConfirmar
                            programacion={programacion}
                            metodo={metodo}
                            paradero={paradero}
                            onConfirm={handleConfirm}
                            onBack={() => setStep('paradero')}
                            loading={confirmLoading}
                            error={confirmError}
                        />
                    )}
                    {step === 'exito' && ticket && (
                        <StepExito ticket={ticket} saldoRestante={saldoRestante} onReset={handleReset} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AbordajePage;