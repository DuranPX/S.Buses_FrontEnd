import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { empresasService, type Empresa } from '../services/empresasService';
import { Loader } from '../../../../shared/components/ui/Loader';
import axios from 'axios';

const EmpresasPage = () => {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para modal/edición
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editNit, setEditNit] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchEmpresas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await empresasService.getAll();
      setEmpresas(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error al cargar el listado de empresas.');
      } else {
        setError('Error al cargar el listado de empresas.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  const handleDelete = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la empresa "${nombre}"?\n\nNota: Los buses asociados no se borrarán, quedarán disponibles para reasignación.`)) {
      return;
    }
    try {
      await empresasService.delete(id);
      fetchEmpresas();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Error al eliminar la empresa.');
      } else {
        alert('Error al eliminar la empresa.');
      }
    }
  };

  const handleOpenEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setEditNombre(empresa.nombre);
    setEditNit(empresa.nit);
  };

  const handleCloseEdit = () => {
    setEditingEmpresa(null);
    setEditNombre('');
    setEditNit('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmpresa) return;

    setIsSaving(true);
    try {
      await empresasService.update(editingEmpresa.id, {
        nombre: editNombre !== editingEmpresa.nombre ? editNombre : undefined,
        nit: editNit !== editingEmpresa.nit ? editNit : undefined,
      });
      handleCloseEdit();
      fetchEmpresas();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Error al actualizar la empresa.');
      } else {
        alert('Error al actualizar la empresa.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const filteredEmpresas = empresas.filter(emp => 
    emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.nit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            Gestión de Empresas de Transporte
          </h1>
          <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
            Administra las empresas operadoras y consulta su flota de buses asociada.
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin/empresas/crear')}
          style={{ background: '#6366f1', color: 'white', padding: '0.7rem 1.4rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
        >
          <span>+ Registrar Empresa</span>
        </button>
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Buscar por nombre o NIT..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '0.8rem 1.2rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.95rem' }}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')} 
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Limpiar
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader /></div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '0.85rem' }}>
                <th style={{ padding: '1.2rem 1rem' }}>Empresa</th>
                <th style={{ padding: '1.2rem 1rem' }}>NIT</th>
                <th style={{ padding: '1.2rem 1rem' }}>Flota Asignada (Buses)</th>
                <th style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmpresas.map(empresa => (
                <tr key={empresa.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1.2rem 1rem', fontWeight: 600, color: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem' }}>
                        {empresa.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        {empresa.nombre}
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>ID: {empresa.id}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1rem', color: '#cbd5e1', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                    {empresa.nit}
                  </td>
                  <td style={{ padding: '1.2rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: (empresa.bus && empresa.bus.length > 0) ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)', color: (empresa.bus && empresa.bus.length > 0) ? '#34d399' : '#94a3b8' }}>
                        {empresa.bus?.length || 0} buses
                      </span>
                      {empresa.bus && empresa.bus.slice(0, 3).map(b => (
                        <span key={b.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                          {b.placa}
                        </span>
                      ))}
                      {empresa.bus && empresa.bus.length > 3 && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>+{empresa.bus.length - 3} más</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleOpenEdit(empresa)} 
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#cbd5e1', padding: '0.5rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }} 
                        title="Editar"
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(empresa.id, empresa.nombre)} 
                        style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '0.5rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }} 
                        title="Eliminar"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEmpresas.length === 0 && (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No se encontraron empresas</p>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Intenta con otro término de búsqueda o registra una nueva empresa.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Edición */}
      {editingEmpresa && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>Editar Empresa</h3>
              <button onClick={handleCloseEdit} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Nombre de la Empresa</label>
                <input 
                  type="text" 
                  value={editNombre} 
                  onChange={e => setEditNombre(e.target.value)} 
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>NIT</label>
                <input 
                  type="text" 
                  value={editNit} 
                  onChange={e => setEditNit(e.target.value)} 
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={handleCloseEdit}
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '0.8rem 1.4rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  style={{ background: '#6366f1', color: 'white', padding: '0.8rem 1.4rem', borderRadius: '0.5rem', border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: isSaving ? 0.7 : 1 }}
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpresasPage;
