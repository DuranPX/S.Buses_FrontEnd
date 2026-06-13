import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorizedBusinessApi } from '../../../../features/roles/utils/authorizedBusinessApi';
import { MODULES } from '../../../../shared/config/modules';
import { turnosService } from '../services/turnosService';
import { Loader } from '../../../../shared/components/ui/Loader';
import axios from 'axios';

interface ConductorOption {
  id: string;
  licencia: string;
  nombre: string;
}

interface BusOption {
  id: string;
  placa: string;
  modelo?: string;
}

const CreateTurnoPage = () => {
  const navigate = useNavigate();
  const [conductores, setConductores] = useState<ConductorOption[]>([]);
  const [buses, setBuses] = useState<BusOption[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    conductorId: '',
    busId: '',
    fecha_inicio_programada: '',
    fecha_fin_programada: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [conductoresRes, busesRes] = await Promise.all([
          authorizedBusinessApi.get(MODULES.CONDUCTORES, '/conductor'),
          authorizedBusinessApi.get(MODULES.BUSES, '/bus'),
        ]);

        setConductores(
          conductoresRes.data.map((c: any) => ({
            id: c.id,
            licencia: c.licencia,
            nombre: c.persona
              ? `${c.persona.firstName} ${c.persona.lastName}`
              : c.licencia,
          }))
        );

        setBuses(
          busesRes.data
            .filter((b: any) => b.estado === 'Operativo')
            .map((b: any) => ({
              id: b.id,
              placa: b.placa,
              modelo: b.modelo,
            }))
        );
      } catch {
        setError('Error al cargar conductores y buses.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.conductorId || !formData.busId || !formData.fecha_inicio_programada || !formData.fecha_fin_programada) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (new Date(formData.fecha_fin_programada) <= new Date(formData.fecha_inicio_programada)) {
      setError('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const selectedBus = buses.find((b) => b.id === formData.busId);
      const payload = {
        conductorId: formData.conductorId,
        // Aseguramos que se envíe el id real del bus seleccionado
        busId: selectedBus?.id ?? formData.busId,
        fecha_inicio_programada: formData.fecha_inicio_programada,
        fecha_fin_programada: formData.fecha_fin_programada,
      };

      console.log('Crear turno con payload:', payload);
      await turnosService.create(payload);
      navigate('/admin/turnos');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error al crear el turno.');
      } else {
        setError('Error al crear el turno.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
          Crear Turno
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Asigna un conductor y un bus a un horario de operación.
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Conductor */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>
            Conductor *
          </label>
          {conductores.length === 0 ? (
            <div style={{ padding: '0.8rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
              No hay conductores disponibles.
            </div>
          ) : (
            <select
              value={formData.conductorId}
              onChange={e => setFormData({ ...formData, conductorId: e.target.value })}
              required
              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', cursor: 'pointer' }}
            >
              <option value="" disabled style={{ background: '#1e293b' }}>Selecciona un conductor</option>
              {conductores.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#1e293b' }}>
                  {c.nombre} — {c.licencia}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Bus */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>
            Bus Asignado *
          </label>
          {buses.length === 0 ? (
            <div style={{ padding: '0.8rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
              No hay buses operativos disponibles.
            </div>
          ) : (
            <select
              value={formData.busId}
              onChange={e => setFormData({ ...formData, busId: e.target.value })}
              required
              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', cursor: 'pointer' }}
            >
              <option value="" disabled style={{ background: '#1e293b' }}>Selecciona un bus operativo</option>
              {buses.map(b => (
                <option key={b.id} value={b.id} style={{ background: '#1e293b' }}>
                  {b.placa} — {b.modelo || 'Sin modelo'}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Fechas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>
              Inicio Programado *
            </label>
            <input
              type="datetime-local"
              value={formData.fecha_inicio_programada}
              onChange={e => setFormData({ ...formData, fecha_inicio_programada: e.target.value })}
              required
              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', colorScheme: 'dark' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>
              Fin Programado *
            </label>
            <input
              type="datetime-local"
              value={formData.fecha_fin_programada}
              onChange={e => setFormData({ ...formData, fecha_fin_programada: e.target.value })}
              required
              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={() => navigate('/admin/turnos')}
            style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isProcessing || !formData.conductorId || !formData.busId}
            style={{ background: '#6366f1', color: 'white', padding: '0.8rem 2rem', borderRadius: '0.5rem', border: 'none', cursor: (isProcessing || !formData.conductorId || !formData.busId) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1rem', opacity: (isProcessing || !formData.conductorId || !formData.busId) ? 0.7 : 1, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
          >
            {isProcessing ? 'Creando...' : 'Crear Turno'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTurnoPage;