import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Semana 1', fallas: 12, accidentes: 2, retrasos: 34 },
  { name: 'Semana 2', fallas: 10, accidentes: 1, retrasos: 28 },
  { name: 'Semana 3', fallas: 15, accidentes: 0, retrasos: 40 },
  { name: 'Semana 4', fallas: 8, accidentes: 3, retrasos: 25 },
];

const IncidentAnalyticsPage = () => {
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
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
            <Legend />
            <Line type="monotone" dataKey="fallas" name="Fallas Mecánicas" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="accidentes" name="Accidentes" stroke="#ef4444" strokeWidth={3} />
            <Line type="monotone" dataKey="retrasos" name="Retrasos" stroke="#6366f1" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IncidentAnalyticsPage;
