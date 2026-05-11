import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IncidentForm } from '../components/IncidentForm';
import { incidentsMockService } from '../services/incidentsMockService';
import type { Incident } from '../types/incident.types';

const CreateIncidentPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (data: Partial<Incident>, file?: File) => {
    setIsProcessing(true);
    setError(null);
    try {
      await incidentsMockService.reportIncident(data as Omit<Incident, 'id' | 'estado' | 'fecha_reporte' | 'evidencia_url'>, file);
      navigate('/incidentes/historial', { state: { success: true } });
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al enviar el reporte.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
          Reportar Incidente
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Ayúdanos a mejorar el servicio reportando cualquier anomalía, retraso o problema mecánico.
        </p>
      </div>

      <IncidentForm onSubmit={handleSubmit} isProcessing={isProcessing} />

      {error && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '0.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default CreateIncidentPage;
