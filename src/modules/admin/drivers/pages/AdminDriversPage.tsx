import { useState, useEffect } from 'react';
import { Loader } from '../../../../shared/components/ui/Loader';
import { driversService, type Conductor, type Empresa, type Turno } from '../services/driversService';

const AdminDriversPage = () => {
  const [drivers, setDrivers] = useState<Conductor[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estado del modal/formulario de asociación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedEmpresasIds, setSelectedEmpresasIds] = useState<string[]>([]);
  const [selectedTurnosIds, setSelectedTurnosIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filtro de pestañas
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING'>('ALL');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [driversData, empresasData, turnosData] = await Promise.all([
        driversService.getAllDrivers().catch(() => []),
        driversService.getAllEmpresas().catch(() => []),
        driversService.getAllTurnos().catch(() => [])
      ]);
      setDrivers(driversData);
      setEmpresas(empresasData);
      setTurnos(turnosData);
    } catch (err) {
      setError('Error al cargar la información del panel de conductores.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAssociateModal = (driver: Conductor) => {
    setSelectedDriverId(driver.id);
    setSelectedEmpresasIds(driver.empresas?.map(e => e.id) || []);
    setSelectedTurnosIds(driver.turnos?.map(t => t.id) || []);
    setIsActive(driver.activo ?? true);
    setIsModalOpen(true);
    setError(null);
    setSuccessMsg(null);
  };

  const handleToggleEmpresa = (empresaId: string) => {
    setSelectedEmpresasIds(prev =>
      prev.includes(empresaId) ? prev.filter(id => id !== empresaId) : [...prev, empresaId]
    );
  };

  const handleToggleTurno = (turnoId: string) => {
    setSelectedTurnosIds(prev =>
      prev.includes(turnoId) ? prev.filter(id => id !== turnoId) : [...prev, turnoId]
    );
  };

  const handleSaveAssociation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId) {
      setError('Por favor selecciona un conductor.');
      return;
    }
    if (selectedEmpresasIds.length === 0) {
      setError('Debes seleccionar al menos una empresa para el conductor.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const updatedDriver = await driversService.associateConductor(selectedDriverId, {
        empresasIds: selectedEmpresasIds,
        turnosIds: selectedTurnosIds,
        activo: isActive
      });

      // Actualizar listado local en vivo
      setDrivers(prev => prev.map(d => d.id === updatedDriver.id ? updatedDriver : d));
      setSuccessMsg('¡Conductor asociado y actualizado exitosamente en el sistema!');
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Error al guardar la asociación del conductor.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDrivers = drivers.filter(d => {
    if (filterTab === 'PENDING') {
      return !d.empresas || d.empresas.length === 0;
    }
    return true;
  });

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto', color: '#f8fafc' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(to right, #34d399, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Panel de Gestión & Asociación de Conductores
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0 }}>
            Administra los conductores registrados, vincula sus empresas y asigna turnos operativos.
          </p>
        </div>
        <button
          onClick={() => {
            if (drivers.length > 0) {
              handleOpenAssociateModal(drivers[0]);
            } else {
              alert('No hay conductores cargados para asociar.');
            }
          }}
          style={{ background: '#6366f1', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
        >
          + Nueva Asociación
        </button>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #34d399', color: '#34d399', padding: '1rem 1.5rem', borderRadius: '0.75rem', marginBottom: '2rem', textAlign: 'center', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {error && !isModalOpen && (
        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '1rem 1.5rem', borderRadius: '0.75rem', marginBottom: '2rem', textAlign: 'center', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* FILTROS RÁPIDOS */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setFilterTab('ALL')}
          style={{ padding: '0.6rem 1.5rem', borderRadius: '0.5rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: filterTab === 'ALL' ? '#6366f1' : 'rgba(255,255,255,0.05)', color: filterTab === 'ALL' ? 'white' : '#94a3b8', transition: 'all 0.2s' }}
        >
          Todos los Conductores ({drivers.length})
        </button>
        <button
          onClick={() => setFilterTab('PENDING')}
          style={{ padding: '0.6rem 1.5rem', borderRadius: '0.5rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: filterTab === 'PENDING' ? '#10b981' : 'rgba(255,255,255,0.05)', color: filterTab === 'PENDING' ? 'white' : '#94a3b8', transition: 'all 0.2s' }}
        >
          Pendientes de Empresa ({drivers.filter(d => !d.empresas || d.empresas.length === 0).length})
        </button>
      </div>

      {/* TABLA DE CONDUCTORES */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <Loader />
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', color: '#94a3b8' }}>
          No se encontraron conductores con el filtro seleccionado.
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', overflow: 'x-auto', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontWeight: 700, fontSize: '0.85rem' }}>CONDUCTOR</th>
                <th style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontWeight: 700, fontSize: '0.85rem' }}>LICENCIA</th>
                <th style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontWeight: 700, fontSize: '0.85rem' }}>EMPRESAS ASOCIADAS</th>
                <th style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontWeight: 700, fontSize: '0.85rem' }}>TURNOS ASIGNADOS</th>
                <th style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontWeight: 700, fontSize: '0.85rem' }}>ESTADO</th>
                <th style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map(driver => {
                const nombreCompleto = driver.persona ? `${driver.persona.nombres || ''} ${driver.persona.apellidos || ''}`.trim() : `${driver.nombres || ''} ${driver.apellidos || ''}`.trim() || 'Conductor Sin Nombre';
                const hasEmpresa = driver.empresas && driver.empresas.length > 0;
                const hasTurnos = driver.turnos && driver.turnos.length > 0;

                return (
                  <tr key={driver.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1.2rem 1.5rem', color: '#f8fafc', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                          {nombreCompleto.charAt(0)}
                        </div>
                        <div>
                          <div>{nombreCompleto}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>ID: {driver.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', color: '#cbd5e1', fontFamily: 'monospace' }}>
                      {driver.licencia || 'LIC-PENDIENTE'}
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      {hasEmpresa ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {driver.empresas!.map(e => (
                            <span key={e.id} style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', padding: '0.2rem 0.6rem', borderRadius: '0.35rem', fontSize: '0.75rem', fontWeight: 600 }}>
                              {e.nombre}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(239,68,68,0.15)', padding: '0.2rem 0.6rem', borderRadius: '0.35rem' }}>
                          ⚠️ Sin Empresa
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      {hasTurnos ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {driver.turnos!.map(t => (
                            <span key={t.id} style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', padding: '0.2rem 0.6rem', borderRadius: '0.35rem', fontSize: '0.75rem' }}>
                              {t.fecha_inicio_programada
                                ? new Date(t.fecha_inicio_programada).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
                                : 'Turno'}{' → '}
                              {t.fecha_fin_programada
                                ? new Date(t.fecha_fin_programada).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
                                : ''}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Sin turno asignado</span>
                      )}
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
                        background: driver.activo ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                        color: driver.activo ? '#10b981' : '#ef4444',
                        border: `1px solid ${driver.activo ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`
                      }}>
                        {driver.activo ? 'Operativo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleOpenAssociateModal(driver)}
                        style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid #6366f1', color: '#a5b4fc', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}
                      >
                        Asociar / Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE ASOCIACIÓN */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', padding: '2.5rem', maxWidth: '650px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>Vincular Empresa & Turnos</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            {error && isModalOpen && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontWeight: 600, textAlign: 'center' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSaveAssociation}>
              {/* SELECTOR DE CONDUCTOR */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>Conductor Seleccionado</label>
                <select
                  value={selectedDriverId} onChange={e => setSelectedDriverId(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', fontWeight: 600 }}
                >
                  <option value="">-- Selecciona un Conductor --</option>
                  {drivers.map(d => {
                    const nom = d.persona ? `${d.persona.nombres || ''} ${d.persona.apellidos || ''}` : `${d.nombres || ''} ${d.apellidos || ''}`;
                    return (
                      <option key={d.id} value={d.id}>
                        {nom.trim() || 'Conductor'} ({d.licencia || 'LIC-PENDIENTE'})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* SELECTOR DE EMPRESAS (Múltiple / Checkboxes) */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Empresas de Transporte <span style={{ color: '#ef4444' }}>* (Mínimo 1 obligatoria)</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {empresas.map(emp => {
                    const isSelected = selectedEmpresasIds.includes(emp.id);
                    return (
                      <div
                        key={emp.id} onClick={() => handleToggleEmpresa(emp.id)}
                        style={{ padding: '0.8rem 1rem', borderRadius: '0.5rem', border: `1px solid ${isSelected ? '#34d399' : 'rgba(255,255,255,0.1)'}`, background: isSelected ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                      >
                        <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: '#34d399', cursor: 'pointer' }} />
                        <span style={{ color: isSelected ? '#34d399' : '#cbd5e1', fontWeight: isSelected ? 700 : 500, fontSize: '0.9rem' }}>{emp.nombre}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SELECTOR DE TURNOS (Opcional / Checkboxes) */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Turnos Operativos <span style={{ color: '#64748b' }}>(Opcional)</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {turnos.map(turno => {
                    const isSelected = selectedTurnosIds.includes(turno.id);
                    return (
                      <div
                        key={turno.id} onClick={() => handleToggleTurno(turno.id)}
                        style={{ padding: '0.8rem 1rem', borderRadius: '0.5rem', border: `1px solid ${isSelected ? '#6366f1' : 'rgba(255,255,255,0.1)'}`, background: isSelected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                      >
                        <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: '#6366f1', cursor: 'pointer' }} />
                        <span style={{ color: isSelected ? '#a5b4fc' : '#cbd5e1', fontWeight: isSelected ? 700 : 500, fontSize: '0.85rem' }}>
                          {turno.fecha_inicio_programada
                            ? new Date(turno.fecha_inicio_programada).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
                            : '—'}{' → '}
                          {turno.fecha_fin_programada
                            ? new Date(turno.fecha_fin_programada).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
                            : '—'}
                          {turno.bus?.placa ? ` | Bus: ${turno.bus.placa}` : ''}
                          {turno.estado ? ` [${turno.estado}]` : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ESTADO ACTIVO */}
              <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox" id="active-check" checked={isActive} onChange={e => setIsActive(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
                />
                <label htmlFor="active-check" style={{ color: '#f1f5f9', fontWeight: 600, cursor: 'pointer' }}>Conductor Operativo / Activo</label>
              </div>

              {/* BOTONES */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button" onClick={() => setIsModalOpen(false)} disabled={isSaving}
                  style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit" disabled={isSaving}
                  style={{ flex: 2, padding: '1rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1.05rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)', opacity: isSaving ? 0.7 : 1 }}
                >
                  {isSaving ? 'Guardando Asociación...' : '✓ Guardar Asociación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDriversPage;