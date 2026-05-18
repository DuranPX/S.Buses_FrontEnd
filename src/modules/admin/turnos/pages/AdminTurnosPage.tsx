import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { turnosService, type Turno } from '../services/turnosService';
import { Loader } from '../../../../shared/components/ui/Loader';

const estadoColor = (estado: string) => {
  switch (estado) {
    case 'PROGRAMADO': return { bg: 'rgba(99,102,241,0.1)', color: '#a5b4fc' };
    case 'EN_CURSO':   return { bg: 'rgba(16,185,129,0.1)', color: '#34d399' };
    case 'FINALIZADO': return { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' };
    default:           return { bg: 'rgba(255,255,255,0.05)', color: '#cbd5e1' };
  }
};

const AdminTurnosPage = () => {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  useEffect(() => {
    turnosService.getAll()
      .then(setTurnos)
      .catch(() => setError('Error al cargar los turnos.'))
      .finally(() => setIsLoading(false));
  }, []);

  const filtrados = turnos.filter(t =>
    filtroEstado === 'TODOS' || t.estado === filtroEstado
  );

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
            Gestión de Turnos
          </h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Asigna conductores a buses y administra los horarios de operación.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/turnos/crear')}
          style={{ background: '#6366f1', color: 'white', padding: '0.7rem 1.4rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
        >
          + Crear Turno
        </button>
      </div>

      {/* Filtros */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        {['TODOS', 'PROGRAMADO', 'EN_CURSO', 'FINALIZADO'].map(estado => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            style={{
              padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.85rem',
              background: filtroEstado === estado ? '#6366f1' : 'rgba(255,255,255,0.05)',
              color: filtroEstado === estado ? 'white' : '#94a3b8',
            }}
          >
            {estado === 'TODOS' ? 'Todos' : estado === 'EN_CURSO' ? 'En Curso' : estado.charAt(0) + estado.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Loader />
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem' }}>Conductor</th>
                <th style={{ padding: '1rem' }}>Bus</th>
                <th style={{ padding: '1rem' }}>Inicio Programado</th>
                <th style={{ padding: '1rem' }}>Fin Programado</th>
                <th style={{ padding: '1rem' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(turno => {
                const colors = estadoColor(turno.estado);
                const nombre = turno.conductor?.persona
                  ? `${turno.conductor.persona.firstName} ${turno.conductor.persona.lastName}`
                  : turno.conductor?.licencia || 'Sin conductor';
                return (
                  <tr key={turno.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', color: '#f8fafc', fontWeight: 600 }}>
                      {nombre}
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                        {turno.conductor?.licencia}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1', fontWeight: 600 }}>
                      {turno.bus?.placa || '—'}
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                      {new Date(turno.fecha_inicio_programada).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                      {new Date(turno.fecha_fin_programada).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: colors.bg, color: colors.color }}>
                        {turno.estado === 'EN_CURSO' ? 'EN CURSO' : turno.estado}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtrados.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              No hay turnos {filtroEstado !== 'TODOS' ? `con estado ${filtroEstado}` : 'registrados'}.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminTurnosPage;