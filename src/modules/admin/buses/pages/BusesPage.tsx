import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { busesService, type Bus } from '../services/busesService';
import { Loader } from '../../../../shared/components/ui/Loader';
import axios from 'axios';

const BusesPage = () => {
  const navigate = useNavigate();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<string>('TODOS');

  // Modal para ver el QR en grande
  const [selectedQrBus, setSelectedQrBus] = useState<Bus | null>(null);

  // Modal para edición de bus
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [editEstado, setEditEstado] = useState('Operativo');
  const [editModelo, setEditModelo] = useState('');
  const [editAnio, setEditAnio] = useState<number>(2026);
  const [editCapacidadTotal, setEditCapacidadTotal] = useState<number>(40);
  const [editCapacidadSentados, setEditCapacidadSentados] = useState<number>(30);
  const [editCapacidadParados, setEditCapacidadParados] = useState<number>(10);
  const [editFotoUrl, setEditFotoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchBuses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await busesService.getAll();
      setBuses(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error al cargar el listado de buses de la flota.');
      } else {
        setError('Error al cargar el listado de buses de la flota.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const handleOpenEdit = (bus: Bus) => {
    setEditingBus(bus);
    setEditEstado(bus.estado || 'Operativo');
    setEditModelo(bus.modelo || '');
    setEditAnio(bus.anio || 2026);
    setEditCapacidadTotal(bus.capacidad_total || 40);
    setEditCapacidadSentados(bus.capacidad_sentados || 30);
    setEditCapacidadParados(bus.capacidad_parados || 10);
    setEditFotoUrl(bus.foto_url || '');
  };

  const handleCloseEdit = () => {
    setEditingBus(null);
  };

  const handleCapacidadEditChange = (val: number) => {
    setEditCapacidadTotal(val);
    const sentados = Math.round(val * 0.75);
    setEditCapacidadSentados(sentados);
    setEditCapacidadParados(val - sentados);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBus) return;

    setIsSaving(true);
    try {
      await busesService.update(editingBus.id, {
        estado: editEstado !== editingBus.estado ? editEstado : undefined,
        modelo: editModelo !== editingBus.modelo ? editModelo : undefined,
        anio: editAnio !== editingBus.anio ? editAnio : undefined,
        capacidad_total: editCapacidadTotal !== editingBus.capacidad_total ? editCapacidadTotal : undefined,
        capacidad_sentados: editCapacidadSentados !== editingBus.capacidad_sentados ? editCapacidadSentados : undefined,
        capacidad_parados: editCapacidadParados !== editingBus.capacidad_parados ? editCapacidadParados : undefined,
        foto_url: editFotoUrl !== editingBus.foto_url ? (editFotoUrl || undefined) : undefined
      });
      handleCloseEdit();
      fetchBuses();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Error al actualizar el bus.');
      } else {
        alert('Error al actualizar el bus.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = bus.placa.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          bus.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bus.empresa?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = selectedEstado === 'TODOS' || bus.estado === selectedEstado;
    return matchesSearch && matchesEstado;
  });

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            Gestión de Flota de Buses
          </h1>
          <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
            Listado completo de la flota de buses, estado mecánico, capacidad y códigos QR.
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin/buses/crear')}
          style={{ background: '#6366f1', color: 'white', padding: '0.7rem 1.4rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
        >
          <span>+ Registrar Bus</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Buscar por placa, modelo o empresa..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: '1 1 300px', padding: '0.8rem 1.2rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.95rem' }}
        />

        <select 
          value={selectedEstado} 
          onChange={e => setSelectedEstado(e.target.value)}
          style={{ padding: '0.8rem 1.2rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.95rem', cursor: 'pointer' }}
        >
          <option value="TODOS" style={{ background: '#1e293b', color: 'white' }}>Todos los Estados</option>
          <option value="Operativo" style={{ background: '#1e293b', color: 'white' }}>Operativo</option>
          <option value="Mantenimiento" style={{ background: '#1e293b', color: 'white' }}>Mantenimiento</option>
          <option value="Fuera_Servicio" style={{ background: '#1e293b', color: 'white' }}>Fuera de Servicio</option>
        </select>

        {(searchTerm || selectedEstado !== 'TODOS') && (
          <button 
            onClick={() => { setSearchTerm(''); setSelectedEstado('TODOS'); }} 
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Limpiar Filtros
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
                <th style={{ padding: '1.2rem 1rem' }}>Bus / Placa</th>
                <th style={{ padding: '1.2rem 1rem' }}>Empresa Operadora</th>
                <th style={{ padding: '1.2rem 1rem' }}>Modelo & Año</th>
                <th style={{ padding: '1.2rem 1rem' }}>Capacidad</th>
                <th style={{ padding: '1.2rem 1rem' }}>Estado</th>
                <th style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuses.map(bus => (
                <tr key={bus.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1.2rem 1rem', fontWeight: 600, color: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '0.5rem', overflow: 'hidden', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {bus.foto_url ? (
                          <img src={bus.foto_url} alt={bus.placa} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.currentTarget.style.display = 'none'} />
                        ) : (
                          <span style={{ fontSize: '1.5rem' }}>🚌</span>
                        )}
                      </div>
                      <div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6366f1', letterSpacing: '1px' }}>{bus.placa}</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>ID: {bus.id}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1rem', color: '#cbd5e1' }}>
                    {bus.empresa ? (
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>{bus.empresa.nombre}</span>
                    ) : (
                      <span style={{ color: '#64748b', fontStyle: 'italic' }}>Sin empresa asignada</span>
                    )}
                  </td>
                  <td style={{ padding: '1.2rem 1rem', color: '#cbd5e1' }}>
                    <div>
                      {bus.modelo || 'No especificado'}
                      <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>Año {bus.anio || 'N/A'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#f8fafc' }}>{bus.capacidad_total || 40}</span> pas.
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        {bus.capacidad_sentados || 30} sentados • {bus.capacidad_parados || 10} parados
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1rem' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      background: bus.estado === 'Operativo' ? 'rgba(16,185,129,0.1)' : bus.estado === 'Mantenimiento' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', 
                      color: bus.estado === 'Operativo' ? '#34d399' : bus.estado === 'Mantenimiento' ? '#fbbf24' : '#f87171' 
                    }}>
                      {bus.estado === 'Operativo' ? 'Operativo' : bus.estado === 'Mantenimiento' ? 'Mantenimiento' : 'Fuera de Servicio'}
                    </span>
                  </td>
                  <td style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => setSelectedQrBus(bus)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '0.5rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        title="Ver QR"
                      >
                        <span>QR 🔍</span>
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(bus)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '0.5rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        title="Editar Bus"
                      >
                        <span>✏️ Editar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBuses.length === 0 && (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No se encontraron buses en la flota</p>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Intenta con otro filtro o registra un nuevo bus.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal para ver QR en grande */}
      {selectedQrBus && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', textAlign: 'center', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>Código QR del Bus</h3>
              <button onClick={() => setSelectedQrBus(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', display: 'inline-block', marginBottom: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
              {selectedQrBus.qr_code ? (
                <img src={selectedQrBus.qr_code} alt={`QR Bus ${selectedQrBus.placa}`} style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
              ) : (
                <div style={{ width: '200px', height: '200px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem', color: '#0f172a', fontWeight: 700, fontSize: '1.4rem', border: '2px solid #cbd5e1' }}>
                  {selectedQrBus.placa}
                </div>
              )}
              <span style={{ display: 'block', marginTop: '1rem', fontWeight: 700, color: '#0f172a', fontSize: '1.4rem', letterSpacing: '2px' }}>{selectedQrBus.placa}</span>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Modelo: <strong>{selectedQrBus.modelo}</strong> ({selectedQrBus.anio})</p>
            {selectedQrBus.empresa && (
              <p style={{ color: '#818cf8', fontSize: '0.9rem', margin: 0 }}>Empresa: {selectedQrBus.empresa.nombre}</p>
            )}

            <button 
              onClick={() => setSelectedQrBus(null)}
              style={{ width: '100%', marginTop: '2rem', background: '#6366f1', color: 'white', padding: '0.8rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Edición de Bus */}
      {editingBus && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', width: '100%', maxWidth: '600px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                Editar Bus: <span style={{ color: '#818cf8' }}>{editingBus.placa}</span>
              </h3>
              <button onClick={handleCloseEdit} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Estado Operativo</label>
                  <select 
                    value={editEstado} 
                    onChange={e => setEditEstado(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', cursor: 'pointer' }}
                  >
                    <option value="Operativo" style={{ background: '#1e293b', color: 'white' }}>Operativo</option>
                    <option value="Mantenimiento" style={{ background: '#1e293b', color: 'white' }}>Mantenimiento</option>
                    <option value="Fuera_Servicio" style={{ background: '#1e293b', color: 'white' }}>Fuera de Servicio</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Modelo</label>
                  <input 
                    type="text" 
                    value={editModelo} 
                    onChange={e => setEditModelo(e.target.value)} 
                    required
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Año de Fabricación</label>
                  <input 
                    type="number" 
                    value={editAnio} 
                    onChange={e => setEditAnio(parseInt(e.target.value) || 2026)} 
                    min={1950}
                    max={2030}
                    required
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Capacidad Total</label>
                  <input 
                    type="number" 
                    value={editCapacidadTotal} 
                    onChange={e => handleCapacidadEditChange(parseInt(e.target.value) || 0)} 
                    min={1}
                    required
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#34d399', fontSize: '1rem', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Pasajeros Sentados</label>
                  <input 
                    type="number" 
                    value={editCapacidadSentados} 
                    onChange={e => setEditCapacidadSentados(parseInt(e.target.value) || 0)} 
                    min={0}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Pasajeros Parados</label>
                  <input 
                    type="number" 
                    value={editCapacidadParados} 
                    onChange={e => setEditCapacidadParados(parseInt(e.target.value) || 0)} 
                    min={0}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>URL de Fotografía</label>
                <input 
                  type="url" 
                  value={editFotoUrl} 
                  onChange={e => setEditFotoUrl(e.target.value)} 
                  placeholder="https://midominio.com/foto.jpg"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
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

export default BusesPage;
