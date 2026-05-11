import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Lunes', recargas: 4000, boletos: 2400 },
  { name: 'Martes', recargas: 3000, boletos: 1398 },
  { name: 'Miércoles', recargas: 2000, boletos: 9800 },
  { name: 'Jueves', recargas: 2780, boletos: 3908 },
  { name: 'Viernes', recargas: 1890, boletos: 4800 },
  { name: 'Sábado', recargas: 2390, boletos: 3800 },
  { name: 'Domingo', recargas: 3490, boletos: 4300 },
];

const IncomeAnalyticsPage = () => {
  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
          Analíticas de Ingresos
        </h1>
        <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
          Distribución de ingresos por recargas de cartera vs venta directa de boletos.
        </p>
      </div>

      <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
            <Legend />
            <Bar dataKey="recargas" stackId="a" fill="#6366f1" name="Recargas Cartera" />
            <Bar dataKey="boletos" stackId="a" fill="#10b981" name="Boletos Individuales" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IncomeAnalyticsPage;
