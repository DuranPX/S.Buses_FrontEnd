import { useState, useEffect } from 'react';
import { alertasService, type AlcanceAlerta } from '../services/alertasService';
import { businessApi } from '../../../../api/api';
import { showAlert } from '../../../../shared/utils/alerts';

interface Ruta { id: string; nombre: string; codigo: string; }
interface ResultadoEnvio {
    status: string;
    mensaje: string;
    alcance: string;
    urgente: boolean;
    destinatarios: string;
    timestamp: string;
}

const AlertasMasivasPage = () => {
    const [rutas, setRutas] = useState<Ruta[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultado, setResultado] = useState<ResultadoEnvio | null>(null);
    const [zonas, setZonas] = useState<string[]>([]);
    const [zonaSeleccionada, setZonaSeleccionada] = useState("");
    const [form, setForm] = useState({
        titulo: '',
        mensaje: '',
        alcance: 'all' as AlcanceAlerta,
        targetId: '',
        urgente: false,
        programadaPara: '',
    });

    useEffect(() => {
        businessApi.get('/rutas')
            .then(res => setRutas(res.data))
            .catch(err => {
                console.error('Error cargando rutas:', err);
            });
    }, []);

    useEffect(() => {

        businessApi
            .get('/direccion/zonas')
            .then(res => {
                setZonas(res.data);
            })
            .catch(err => {
                console.error(
                    "Error cargando zonas",
                    err
                );
            });

    }, []);

    const destinatariosLabel = () => {
        if (form.alcance === 'all') return 'Todos los usuarios del sistema';
        if (form.alcance === 'route') {
            const ruta = rutas.find(r => r.id === form.targetId);
            return ruta ? `Usuarios de ruta: ${ruta.nombre}` : 'Selecciona una ruta';
        }
        return form.targetId ? `Zona: ${form.targetId}` : 'Escribe el ID de zona';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.titulo.trim() || !form.mensaje.trim()) {
            return showAlert.warning('Campos requeridos', 'El título y el mensaje son obligatorios.');
        }
        if ((form.alcance === 'route' || form.alcance === 'zone') && !form.targetId) {
            return showAlert.warning('Destino requerido', 'Debes seleccionar una ruta o zona.');
        }

        const confirmMsg = form.urgente
            ? '¿Enviar alerta URGENTE? Los usuarios recibirán una notificación prioritaria.'
            : '¿Enviar esta alerta masiva?';
        const confirm = await showAlert.warning('Confirmar envío', confirmMsg);
        if (!confirm.isConfirmed) return;

        setIsProcessing(true);
        setResultado(null);
        try {
            const res = await alertasService.enviar({
                ...form,
                programadaPara: form.programadaPara || undefined,
                targetId: form.targetId || undefined,
            });
            setResultado(res);
            setForm({ titulo: '', mensaje: '', alcance: 'all', targetId: '', urgente: false, programadaPara: '' });
            showAlert.success(
                res.status === 'PROGRAMADA' ? 'Alerta programada' : 'Alerta enviada',
                res.mensaje
            );
        } catch (err: any) {
            showAlert.error('Error', err?.response?.data?.message || 'No se pudo enviar la alerta.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Header */}
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f8fafc' }}>
                    🔔 Alertas Masivas
                </h1>
                <p style={{ color: '#94a3b8', margin: 0 }}>
                    Envía notificaciones a todos los usuarios o a grupos específicos.
                    Los usuarios no pueden responder a estas alertas.
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Título */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Contenido</h2>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Título *</label>
                        <input
                            type="text"
                            value={form.titulo}
                            onChange={e => setForm({ ...form, titulo: e.target.value })}
                            placeholder="Ej. Interrupción temporal del servicio"
                            maxLength={100}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '0.95rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                            Mensaje * <span style={{ color: '#64748b' }}>({form.mensaje.length}/500)</span>
                        </label>
                        <textarea
                            value={form.mensaje}
                            onChange={e => setForm({ ...form, mensaje: e.target.value })}
                            placeholder="Escribe el mensaje que recibirán los usuarios..."
                            maxLength={500}
                            rows={4}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '0.95rem', resize: 'vertical' }}
                        />
                    </div>

                    {/* Urgente */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: form.urgente ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: `1px solid ${form.urgente ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                        <input type="checkbox" checked={form.urgente} onChange={e => setForm({ ...form, urgente: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#ef4444' }} />
                        <div>
                            <div style={{ color: form.urgente ? '#f87171' : '#cbd5e1', fontWeight: 600, fontSize: '0.9rem' }}>
                                🚨 Marcar como URGENTE
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                Genera notificación push prioritaria inmediata
                            </div>
                        </div>
                    </label>
                </div>

                {/* Alcance */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Destinatarios</h2>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {[
                            { value: 'all', label: '🌐 Todos los usuarios' },
                            { value: 'route', label: '🚌 Por ruta' },
                            { value: 'zone', label: '📍 Por zona' },
                        ].map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setForm({ ...form, alcance: opt.value as AlcanceAlerta, targetId: '' })}
                                style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: form.alcance === opt.value ? '#6366f1' : 'rgba(255,255,255,0.05)', color: form.alcance === opt.value ? 'white' : '#94a3b8' }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {form.alcance === 'route' && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Selecciona la ruta *</label>
                            <select
                                value={form.targetId}
                                onChange={e => setForm({ ...form, targetId: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '0.95rem' }}
                            >
                                <option value="" style={{ background: '#1e293b' }}>Selecciona una ruta...</option>
                                {rutas.map(r => (
                                    <option key={r.id} value={r.id} style={{ background: '#1e293b' }}>
                                        {r.codigo} — {r.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {form.alcance === 'zone' && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem'
                        }}>

                            <label style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                                textTransform: 'uppercase'
                            }}>
                                Zona
                            </label>

                            <select
                                value={zonaSeleccionada}
                                onChange={e => {
                                    setZonaSeleccionada(e.target.value);
                                    setForm({ ...form, targetId: e.target.value });
                                }}
                                style={{
                                    padding: '0.7rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'inherit',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    colorScheme: 'dark',  // ← agregar esto
                                }}
                            >
                                <option value="" style={{ background: '#1e293b', color: '#f8fafc' }}>
                                    Selecciona una zona
                                </option>
                                {zonas.map(zona => (
                                    <option key={zona} value={zona} style={{ background: '#1e293b', color: '#f8fafc' }}>
                                        {zona}
                                    </option>
                                ))}
                            </select>

                        </div>
                    )}

                    {/* Preview destinatarios */}
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.08)', borderRadius: '0.5rem', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.85rem', color: '#a5b4fc' }}>
                        📋 Destinatarios: <strong>{destinatariosLabel()}</strong>
                    </div>
                </div>

                {/* Programar envío */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Programar envío (opcional)</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                        Si dejas este campo vacío, la alerta se envía inmediatamente.
                    </p>
                    <input
                        type="datetime-local"
                        value={form.programadaPara}
                        onChange={e => setForm({ ...form, programadaPara: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '0.95rem', colorScheme: 'dark' }}
                    />
                </div>

                {/* Botón enviar */}
                <button
                    type="submit"
                    disabled={isProcessing || !form.titulo.trim() || !form.mensaje.trim()}
                    style={{
                        background: form.urgente ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#6366f1',
                        color: 'white', border: 'none', padding: '1rem', borderRadius: '0.75rem',
                        cursor: (isProcessing || !form.titulo.trim() || !form.mensaje.trim()) ? 'not-allowed' : 'pointer',
                        fontWeight: 700, fontSize: '1rem',
                        opacity: (isProcessing || !form.titulo.trim() || !form.mensaje.trim()) ? 0.6 : 1,
                        boxShadow: form.urgente ? '0 4px 15px rgba(239,68,68,0.4)' : '0 4px 15px rgba(99,102,241,0.3)',
                    }}
                >
                    {isProcessing ? 'Enviando...' : form.programadaPara ? '📅 Programar Alerta' : form.urgente ? '🚨 Enviar Alerta Urgente' : '📢 Enviar Alerta'}
                </button>
            </form>

            {/* Resultado del último envío */}
            {resultado && (
                <div style={{ background: resultado.status === 'PROGRAMADA' ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${resultado.status === 'PROGRAMADA' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h3 style={{ margin: 0, color: resultado.status === 'PROGRAMADA' ? '#fbbf24' : '#34d399', fontWeight: 700 }}>
                        {resultado.status === 'PROGRAMADA' ? '📅 Alerta programada' : '✅ Alerta enviada exitosamente'}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span>📋 Destinatarios: <strong style={{ color: '#cbd5e1' }}>{resultado.destinatarios}</strong></span>
                        <span>⚡ Prioridad: <strong style={{ color: resultado.urgente ? '#f87171' : '#94a3b8' }}>{resultado.urgente ? 'URGENTE' : 'Normal'}</strong></span>
                        <span>🕐 Timestamp: <strong style={{ color: '#cbd5e1' }}>{new Date(resultado.timestamp).toLocaleString('es-CO')}</strong></span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlertasMasivasPage;