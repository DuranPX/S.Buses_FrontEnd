import { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { incidentsService } from '../../incidents/services/incidentsService';
import { Loader } from '../../../shared/components/ui/Loader';
import type { Incidente } from '../../incidents/types/incident.types';

const IncidentAnalyticsPage = () => {
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incidentsService.getAll()
      .then(setIncidentes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const data = useMemo(() => {
    const semanas = [
      { name: 'Semana 1', fallas: 0, accidentes: 0, retrasos: 0 },
      { name: 'Semana 2', fallas: 0, accidentes: 0, retrasos: 0 },
      { name: 'Semana 3', fallas: 0, accidentes: 0, retrasos: 0 },
      { name: 'Semana 4', fallas: 0, accidentes: 0, retrasos: 0 },
    ];

    incidentes.forEach(inc => {
      const fecha = new Date(inc.fecha_reporte);
      const dia = fecha.getDate();
      const semanaIdx = Math.min(Math.floor((dia - 1) / 7), 3);

      if (inc.tipo === 'Mecánico') semanas[semanaIdx].fallas++;
      else if (inc.tipo === 'Accidente') semanas[semanaIdx].accidentes++;
      else if (inc.tipo === 'Retraso') semanas[semanaIdx].retrasos++;
    });

    return semanas;
  }, [incidentes]);

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
          Analíticas de Incidentes
        </h1>
        <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
          Evolución mensual de fallas mecánicas, accidentes y retrasos reportados.
        </p>
      </div>

      <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Loader />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="fallas"     name="Fallas Mecánicas" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="accidentes" name="Accidentes"        stroke="#ef4444" strokeWidth={3} />
              <Line type="monotone" dataKey="retrasos"   name="Retrasos"          stroke="#6366f1" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default IncidentAnalyticsPage;