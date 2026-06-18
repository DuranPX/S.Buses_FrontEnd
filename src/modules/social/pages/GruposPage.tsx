import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gruposService, type Grupo, type GrupoPersona } from '../services/gruposService';
import { Loader } from '../../../shared/components/ui/Loader';
import { showAlert } from '../../../shared/utils/alerts';
import CreateGrupoModal from '../components/CreateGrupoModal';

const GruposPage = () => {
    const navigate = useNavigate();
    const [misGrupos, setMisGrupos] = useState<GrupoPersona[]>([]);
    const [gruposPublicos, setGruposPublicos] = useState<Grupo[]>([]);
    const [invitaciones, setInvitaciones] = useState<InvitacionGrupo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tab, setTab] = useState<'mis-grupos' | 'explorar' | 'invitaciones'>('mis-grupos');
    const [busqueda, setBusqueda] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    interface InvitacionGrupo {
        grupoId: string;
        nombre: string;
        descripcion?: string;
    }

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [
                mis,
                publicos,
                invitacionesData
            ] = await Promise.all([
                gruposService.getMisGrupos(),
                gruposService.getPublicos(
                    busqueda || undefined
                ),
                gruposService.getMisInvitaciones(),
            ]);

            setMisGrupos(mis);
            setGruposPublicos(publicos);
            setInvitaciones(invitacionesData);
        } catch {
            // silencioso
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [busqueda]);

    const handleJoin = async (grupoId: string, nombre: string) => {
        try {
            await gruposService.join(grupoId);
            await fetchData();
            await showAlert.success('¡Te uniste!', `Ahora eres miembro de "${nombre}"`);
        } catch (err: any) {
            showAlert.error('Error', err?.response?.data?.message || 'No se pudo unir al grupo');
        }
    };

    const handleLeave = async (grupoId: string, nombre: string) => {
        const confirm = await showAlert.warning('¿Abandonar grupo?', `¿Seguro que quieres salir de "${nombre}"?`);
        if (!confirm.isConfirmed) return;
        try {
            await gruposService.leave(grupoId);
            await fetchData();
            await showAlert.success('Saliste', `Ya no eres miembro de "${nombre}"`);
        } catch (err: any) {
            showAlert.error('Error', err?.response?.data?.message || 'No se pudo salir del grupo');
        }
    };

    const handleAceptarInvitacion = async (grupoId: string) => {
        try {
            await gruposService.aceptarInvitacion(grupoId);

            // Esperar a que fetchData termine antes de mostrar la alerta
            await fetchData();

            // Cambiar al tab de mis-grupos para que vea el grupo
            setTab('mis-grupos');

            await showAlert.success(
                'Invitación aceptada',
                'Ahora eres miembro del grupo.'
            );
        } catch (err: any) {
            showAlert.error(
                'Error',
                err?.response?.data?.message || 'No se pudo aceptar la invitación'
            );
        }
    };

    const handleRechazarInvitacion =
        async (grupoId: string) => {

            try {

                await gruposService
                    .rechazarInvitacion(grupoId);

                await fetchData();

                await showAlert.success(
                    'Invitación rechazada',
                    'La invitación fue eliminada.'
                );

            } catch (err: any) {

                showAlert.error(
                    'Error',
                    err?.response?.data?.message
                );
            }
        };

    const isMember = (grupoId: string) => misGrupos.some(gp => gp.grupo?.id === grupoId || (gp as any).grupo?.id === grupoId);
    console.log('misGrupos:', misGrupos);

    const cardStyle = {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1rem',
        padding: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f8fafc' }}>Grupos</h1>
                    <p style={{ color: '#94a3b8', margin: 0 }}>Crea y administra grupos de comunicación.</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.7rem 1.4rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
                >
                    + Crear Grupo
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                    {
                        key: 'mis-grupos',
                        label: 'Mis Grupos'
                    },
                    {
                        key: 'explorar',
                        label: 'Explorar Públicos'
                    },
                    {
                        key: 'invitaciones',
                        label: `Invitaciones (${invitaciones.length})`
                    }
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key as any)} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', background: tab === t.key ? '#6366f1' : 'rgba(255,255,255,0.05)', color: tab === t.key ? 'white' : '#94a3b8' }}>
                        {t.label}
                    </button>
                ))}
            </div>


            {/* Buscador (solo en explorar) */}
            {tab === 'explorar' && (
                <input
                    type="text"
                    placeholder="Buscar grupos por nombre..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '0.95rem', outline: 'none' }}
                />
            )}

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader /></div>
            ) : tab === 'mis-grupos' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {misGrupos.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
                            <p>No perteneces a ningún grupo aún.</p>
                        </div>
                    ) : misGrupos.map(gp => {
                        const grupo = gp.grupo;
                        if (!grupo) return null;
                        return (
                            <div key={gp.id} style={cardStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: grupo.imagen ? 'transparent' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 700, color: 'white', flexShrink: 0, overflow: 'hidden' }}>
                                        {grupo.imagen ? <img src={grupo.imagen} alt={grupo.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : grupo.nombre!.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{grupo.nombre}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{grupo.descripcion || 'Sin descripción'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                            {gp.rol === 'admin' ? 'Admin' : 'Miembro'} · {grupo.esPublico ? 'Público' : 'Privado'}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => navigate(`/grupos/${grupo.id}`)} style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                                        Ver
                                    </button>
                                    <button onClick={() => handleLeave(grupo.id, grupo.nombre!)} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                        Salir
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : tab === 'invitaciones' ? (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                    }}
                >

                    {invitaciones.length === 0 ? (

                        <div
                            style={{
                                textAlign: 'center',
                                padding: '3rem',
                                color: '#64748b'
                            }}
                        >
                            <p>No tienes invitaciones pendientes.</p>
                        </div>

                    ) : (

                        invitaciones.map(inv => (

                            <div
                                key={inv.grupoId}
                                style={cardStyle}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontWeight: 700,
                                            color: '#f8fafc'
                                        }}
                                    >
                                        {inv.nombre}
                                    </div>

                                    <div
                                        style={{
                                            fontSize: '0.8rem',
                                            color: '#94a3b8'
                                        }}
                                    >
                                        {inv.descripcion ||
                                            'Sin descripción'}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <button
                                        onClick={() =>
                                            handleAceptarInvitacion(
                                                inv.grupoId
                                            )
                                        }
                                        style={{
                                            background: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Aceptar
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleRechazarInvitacion(
                                                inv.grupoId
                                            )
                                        }
                                        style={{
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Rechazar
                                    </button>
                                </div>
                            </div>

                        ))

                    )}

                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {gruposPublicos.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
                            <p>No se encontraron grupos públicos.</p>
                        </div>
                    ) : gruposPublicos.map(grupo => {
                        const yaEsMiembro = isMember(grupo.id);
                        return (
                            <div key={grupo.id} style={cardStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                                        {grupo.imagen ? <img src={grupo.imagen} alt={grupo.nombre} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : ''}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{grupo.nombre}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{grupo.descripcion || 'Sin descripción'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                            {grupo.grupoPersonas?.length || 0} miembros
                                        </div>
                                    </div>
                                </div>
                                {yaEsMiembro ? (
                                    <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>✓ Miembro</span>
                                ) : (
                                    <button onClick={() => handleJoin(grupo.id, grupo.nombre!)} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                                        Unirse
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {showCreate && (
                <CreateGrupoModal
                    onClose={() => setShowCreate(false)}
                    onCreated={() => { setShowCreate(false); fetchData(); }}
                />
            )}
        </div>
    );
};

export default GruposPage;