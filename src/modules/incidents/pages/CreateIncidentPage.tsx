// src/modules/incidents/pages/CreateIncidentPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IncidentForm } from '../components/IncidentForm';
import { incidentsService } from '../services/incidentsService';
import { showAlert } from '../../../shared/utils/alerts';
import { useDriverShift } from '../../drivers/hooks/useDriverShift';
import type { CreateIncidenteDto } from '../types/incident.types';

const CreateIncidentPage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const { shift } = useDriverShift();

  const handleSubmit = async (data: CreateIncidenteDto, fotos: File[]) => {
    if (!shift?.bus_id) {
      showAlert.error(
        'Sin turno activo',
        'Debes tener un turno en curso para reportar un incidente',
      );
      return;
    }

    setIsProcessing(true);
    try {
      // Paso 1 — Crear el incidente base
      const incidente = await incidentsService.createIncidente(data);

      // Paso 2 — Asociar al bus del turno activo y subir fotos
      await incidentsService.reportarConFotos(
        { incidente_id: incidente.id, bus_id: shift.bus_id },
        fotos,
      );

      showAlert.success(
        '¡Incidente reportado!',
        'El reporte fue enviado. El supervisor será notificado si la gravedad es alta o crítica.',
      );
      navigate('/incidentes/historial');
    } catch {
      showAlert.error(
        'Error al reportar',
        'No se pudo enviar el reporte. Intenta de nuevo.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            Reportar Incidente
          </h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Ayúdanos a mejorar el servicio reportando cualquier anomalía durante tu turno.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          ← Volver
        </button>
      </div>

      {/* Info del turno activo */}
      {shift ? (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#a5b4fc' }}>
          <span>🚌</span>
          <span>
            Turno activo — Bus <strong>{shift.bus_placa || shift.bus_id}</strong>
          </span>
        </div>
      ) : (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#fca5a5' }}>
          <span>⚠️</span>
          <span>No tienes un turno activo. Debes iniciar tu turno antes de reportar un incidente.</span>
        </div>
      )}

      <IncidentForm onSubmit={handleSubmit} isProcessing={isProcessing} />
    </div>
  );
};

export default CreateIncidentPage;