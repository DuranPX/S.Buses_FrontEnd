import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routesService } from '../../../routes/services/routesService';
import { busesService, type Bus } from '../../buses/services/busesService';
import { EstadoProgramacion, schedulesService, TipoRecurrencia, type CreateProgramacionDto } from '../services/schedulesService';
import type { Route } from '../../../routes/types/route.types';
import { Loader } from '../../../../shared/components/ui/Loader';

const CreateSchedulePage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);

  const [formData, setFormData] = useState<CreateProgramacionDto>({
    ruta_id: '',
    bus_id: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_salida: '06:00',
    tipo_recurrencia: TipoRecurrencia.DIARIA,
    estado: EstadoProgramacion.PROGRAMADO,
    tolerancia_minutos: 5,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesRes, busesRes] = await Promise.all([
          routesService.getAll(),
          busesService.getAll(),
        ]);
        setRoutes(routesRes);
        setBuses(busesRes);

        if (routesRes.length > 0) setFormData(prev => ({ ...prev, ruta_id: routesRes[0].id }));
        if (busesRes.length > 0) setFormData(prev => ({ ...prev, bus_id: busesRes[0].id }));
      } catch (err: any) {
        setError('Error al cargar datos necesarios. Verifica la conexión.');
        console.error(err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ruta_id || !formData.bus_id) return;

    setIsProcessing(true);
    setError(null);
    try {
      await schedulesService.create(formData);
      navigate('/admin/programaciones');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al crear la programación.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingData) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader /></div>;

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem', color: '#f8fafc' }}>
            Nueva Programación
          </h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Conecta una ruta con un bus en un horario específico.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
        >
          ← Volver
        </button>
      </div>

      <form onSubmit={handleSave} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '2rem' }}>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Ruta</label>
          <select
            value={formData.ruta_id}
            onChange={e => setFormData({ ...formData, ruta_id: e.target.value })}
            style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          >
            {routes.map(r => <option key={r.id} value={r.id}>{r.codigo}: {r.nombre}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Bus</label>
          <select
            value={formData.bus_id}
            onChange={e => setFormData({ ...formData, bus_id: e.target.value })}
            style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          >
            {buses.map(b => <option key={b.id} value={b.id}>{b.placa} (Cap: {b.capacidad_total})</option>)}
          </select>
          {buses.length === 0 && (
            <p style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: '0.4rem' }}>
              No hay buses operativos disponibles
            </p>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Fecha</label>
          <input
            type="date"
            value={formData.fecha}
            onChange={e => setFormData({ ...formData, fecha: e.target.value })}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '0.5rem',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Hora de Salida</label>
            <input
              type="time"
              value={formData.hora_salida}
              onChange={e => setFormData({ ...formData, hora_salida: e.target.value })}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Tolerancia (Minutos)</label>
            <input
              type="number"
              value={formData.tolerancia_minutos}
              min={0}
              max={30}
              onChange={e => setFormData({ ...formData, tolerancia_minutos: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Recurrencia</label>
          <select
            value={formData.tipo_recurrencia}
            onChange={e => setFormData({ ...formData, tipo_recurrencia: e.target.value as TipoRecurrencia })}
            style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          >
            <option value={TipoRecurrencia.DIARIA}>Diaria</option>
            <option value={TipoRecurrencia.LABORAL}>Laboral (L-V)</option>
            <option value={TipoRecurrencia.FIN_SEMANA}>Fines de Semana</option>
          </select>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Estado</label>
          <select
            value={formData.estado}
            onChange={e => setFormData({ ...formData, estado: e.target.value as EstadoProgramacion })}
            style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          >
            <option value={EstadoProgramacion.PROGRAMADO}>Programado</option>
            <option value={EstadoProgramacion.EN_CURSO}>En Curso</option>
            <option value={EstadoProgramacion.FINALIZADO}>Finalizado</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          style={{ width: '100%', background: '#6366f1', color: 'white', padding: '1rem', borderRadius: '0.5rem', border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1.1rem', opacity: isProcessing ? 0.7 : 1 }}
        >
          {isProcessing ? 'Creando programación...' : 'Crear Programación'}
        </button>
      </form>
    </div>
  );
};

export default CreateSchedulePage;