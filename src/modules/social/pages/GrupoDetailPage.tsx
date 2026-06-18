import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gruposService, type Grupo, type GrupoPersona, type LogEntry } from '../services/gruposService';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { Loader } from '../../../shared/components/ui/Loader';
import { showAlert } from '../../../shared/utils/alerts';
import { businessApi } from '../../../api/api';
import EditGrupoModal from '../components/EditGrupoModal';

const GrupoDetailPage = () => {

    interface PersonaOption {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    }
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [grupo, setGrupo] = useState<Grupo | null>(null);
    const [miembros, setMiembros] = useState<GrupoPersona[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [busquedaUsuarios, setBusquedaUsuarios] = useState('');
    const [busquedaMiembros, setBusquedaMiembros] = useState('');
    const [resultados, setResultados] = useState<PersonaOption[]>([]);
    const [personaSeleccionada, setPersonaSeleccionada] = useState<PersonaOption | null>(null);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [log, setLog] = useState<LogEntry[]>([]);
    const navigate = useNavigate();

    const isAdmin = grupo?.creadorAuthId === user?.id ||
        miembros.find(m => m.persona?.authId === user?.id)?.rol === 'admin';

    const fetchData = async () => {
        console.log('FETCH DATA INICIADO');

        if (!id) return;

        setIsLoading(true);

        try {
            const [g, m, logData] = await Promise.all([
                gruposService.getOne(id),
                gruposService.getMembers(id),
                gruposService.getLog(id),
            ]);
            setGrupo(g);
            setMiembros(m);
            setLog(logData);
        } catch (error) {
            console.error('ERROR FETCHDATA', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    useEffect(() => {
        if (busquedaUsuarios.trim().length < 2) {
            setResultados([]);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                const { data } = await businessApi.get(
                    `/persona?search=${encodeURIComponent(busquedaUsuarios)}`
                );

                setResultados(Array.isArray(data) ? data : []);
            } catch {
                setResultados([]);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [busquedaUsuarios]);

    const handleRemove = async (personaId: string, nombre: string) => {
        const confirm = await showAlert.warning('¿Remover miembro?', `¿Remover a ${nombre} del grupo?`);
        if (!confirm.isConfirmed) return;
        try {
            await gruposService.removeMember(id!, personaId);
            await showAlert.success('Removido', `${nombre} fue removido del grupo.`);
            fetchData();
        } catch (err: any) {
            showAlert.error('Error', err?.response?.data?.message || 'No se pudo remover.');
        }
    };

    const handlePromote = async (personaId: string, nombre: string) => {
        try {
            await gruposService.promoteMember(id!, personaId);
            await showAlert.success('Promovido', `${nombre} ahora es administrador.`);
            fetchData();
        } catch (err: any) {
            showAlert.error('Error', err?.response?.data?.message || 'No se pudo promover.');
        }
    };

    const handleBlock = async (personaId: string, nombre: string) => {
        const confirm = await showAlert.warning('¿Bloquear?', `¿Bloquear a ${nombre}? No podrá volver a unirse.`);
        if (!confirm.isConfirmed) return;
        try {
            await gruposService.blockMember(id!, personaId);
            await showAlert.success('Bloqueado', `${nombre} fue bloqueado.`);
            fetchData();
        } catch (err: any) {
            showAlert.error('Error', err?.response?.data?.message || 'No se pudo bloquear.');
        }
    };

    const handleAddMember = async () => {
        if (!personaSeleccionada) return;

        setIsAddingMember(true);

        try {

            const response =
                await gruposService.addMember(
                    id!,
                    personaSeleccionada.id
                );

            if (response?.tipo === 'INVITACION') {

                await showAlert.success(
                    'Invitación enviada',
                    `${personaSeleccionada.firstName} recibió una invitación para unirse al grupo.`
                );

            } else {

                await showAlert.success(
                    'Usuario agregado',
                    `${personaSeleccionada.firstName} fue agregado al grupo.`
                );

            }

            setBusquedaUsuarios('');
            setResultados([]);
            setPersonaSeleccionada(null);

            fetchData();

        } catch (err: any) {

            showAlert.error(
                'Error',
                err?.response?.data?.message ||
                'No se pudo procesar.'
            );

        } finally {

            setIsAddingMember(false);

        }
    };

    const handleDeleteGroup = async () => {
        const confirm = await showAlert.warning(
            '¿Eliminar grupo?',
            `Esta acción eliminará "${grupo!.nombre}" permanentemente y todos los miembros quedarán desvinculados. No se puede deshacer.`
        );
        if (!confirm.isConfirmed) return;

        try {
            await gruposService.remove(id!);
            await showAlert.success('Grupo eliminado', `"${grupo!.nombre}" fue eliminado correctamente.`);
            navigate('/grupos');
        } catch (err: any) {
            showAlert.error('Error', err?.response?.data?.message || 'No se pudo eliminar el grupo.');
        }
    };

    const filtrados = miembros.filter(m => {
        if (!busquedaMiembros) return true;
        const nombre = `${m.persona?.firstName} ${m.persona?.lastName}`.toLowerCase();
        return nombre.includes(busquedaMiembros.toLowerCase());
    });

    if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader /></div>;
    if (!grupo) return null;

    return (
        <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header del grupo */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>👥</div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>{grupo.nombre}</h1>
                    <p style={{ margin: '0 0 0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>{grupo.descripcion}</p>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                        <span>{grupo.esPublico ? ' Público' : ' Privado'}</span>
                        <span>·</span>
                        <span>{miembros.length} miembros</span>
                        {isAdmin && <><span>·</span><span style={{ color: '#a5b4fc' }}>👑 Eres administrador</span></>}
                        {isAdmin && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                <button onClick={() => setShowEdit(true)} style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                                    Editar Grupo
                                </button>
                                <button onClick={handleDeleteGroup} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                                    Eliminar Grupo
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Agregar miembro (solo admin) */}
            {isAdmin && (
                <div
                    style={{
                        background: 'rgba(99,102,241,0.05)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: '1rem',
                        padding: '1.25rem'
                    }}
                >
                    <h3
                        style={{
                            margin: '0 0 1rem',
                            color: '#a5b4fc',
                            fontSize: '1rem'
                        }}
                    >
                        Agregar miembro
                    </h3>

                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Buscar usuario..."
                            value={busquedaUsuarios}
                            onChange={e => setBusquedaUsuarios(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#f8fafc'
                            }}
                        />

                        {resultados.length > 0 && (
                            <div
                                style={{
                                    position: 'absolute',
                                    width: '100%',
                                    zIndex: 10,
                                    background: '#1e293b',
                                    borderRadius: '0.5rem',
                                    marginTop: '0.25rem',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                {resultados.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => {
                                            setPersonaSeleccionada(p);
                                            setBusquedaUsuarios(
                                                `${p.firstName} ${p.lastName}`
                                            );
                                            setResultados([]);
                                        }}
                                        style={{
                                            padding: '0.75rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {p.firstName} {p.lastName}
                                        <br />
                                        <small>{p.email}</small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {personaSeleccionada && (
                        <div
                            style={{
                                marginTop: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <span>
                                Seleccionado:
                                {' '}
                                {personaSeleccionada.firstName}
                                {' '}
                                {personaSeleccionada.lastName}
                            </span>

                            <button
                                onClick={handleAddMember}
                                disabled={isAddingMember}
                                style={{
                                    background: '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {isAddingMember
                                    ? 'Procesando...'
                                    : grupo.esPublico
                                        ? 'Agregar'
                                        : 'Invitar'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Lista de miembros */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Miembros</h2>
                    <input type="text" placeholder="Buscar miembro..." value={busquedaMiembros} onChange={e => setBusquedaMiembros(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '0.85rem', width: '180px' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {filtrados.map(m => {
                        const nombre = `${m.persona?.firstName} ${m.persona?.lastName}`;
                        const esMismoUsuario = m.persona?.authId === user?.id;
                        return (
                            <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#a5b4fc', fontSize: '0.9rem' }}>
                                        {(m.persona?.firstName || '?')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{nombre} {esMismoUsuario && <span style={{ color: '#64748b', fontSize: '0.8rem' }}>(tú)</span>}</div>
                                        <div style={{ fontSize: '0.75rem', color: m.rol === 'admin' ? '#a5b4fc' : '#64748b' }}>
                                            {m.rol === 'admin' ? 'Administrador' : 'Miembro'} · desde {new Date(m.fechaUnion!).toLocaleDateString('es-CO')}
                                        </div>
                                    </div>
                                </div>

                                {isAdmin && !esMismoUsuario && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {m.rol !== 'admin' && (
                                            <button onClick={() => handlePromote(m.persona!.id, nombre)} title="Promover a admin" style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                Promover
                                            </button>
                                        )}
                                        <button onClick={() => handleRemove(m.persona!.id, nombre)} title="Remover del grupo" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                            Remover
                                        </button>
                                        <button onClick={() => handleBlock(m.persona!.id, nombre)} title="Bloquear" style={{ background: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                            Bloquear
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            {isAdmin && log.length > 0 && (
                <div>
                    <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                        Log de Membresía
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {log.map((entry, i) => {
                            const accionColor: Record<string, string> = {
                                MIEMBRO_AGREGADO: '#34d399',
                                'INVITACIÓN_ACEPTADA': '#34d399',
                                SE_UNIÓ: '#34d399',
                                MIEMBRO_REMOVIDO: '#f87171',
                                BLOQUEADO: '#f87171',
                                'SALIÓ_DEL_GRUPO': '#fbbf24',
                                PROMOVIDO_A_ADMIN: '#a5b4fc',
                            };
                            const accionLabel: Record<string, string> = {
                                MIEMBRO_AGREGADO: 'fue agregado',
                                'INVITACIÓN_ACEPTADA': 'aceptó invitación',
                                SE_UNIÓ: 'se unió',
                                MIEMBRO_REMOVIDO: 'fue removido',
                                BLOQUEADO: 'fue bloqueado',
                                'SALIÓ_DEL_GRUPO': 'salió del grupo',
                                PROMOVIDO_A_ADMIN: 'fue promovido a admin',
                            };
                            return (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ color: accionColor[entry.accion] || '#94a3b8', fontWeight: 600 }}>
                                            {entry.personaNombre}
                                        </span>
                                        <span style={{ color: '#64748b' }}>
                                            {accionLabel[entry.accion] || entry.accion}
                                        </span>
                                        {entry.realizadoPorNombre && entry.realizadoPorNombre !== entry.personaNombre && (
                                            <span style={{ color: '#64748b' }}>
                                                por <span style={{ color: '#94a3b8' }}>{entry.realizadoPorNombre}</span>
                                            </span>
                                        )}
                                    </div>
                                    <span style={{ color: '#64748b', fontSize: '0.75rem', flexShrink: 0 }}>
                                        {new Date(entry.fecha).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {showEdit && (
                <EditGrupoModal
                    grupo={grupo}
                    onClose={() => setShowEdit(false)}
                    onUpdated={() => { setShowEdit(false); fetchData(); }}
                />
            )}
        </div>
    );
};

export default GrupoDetailPage;