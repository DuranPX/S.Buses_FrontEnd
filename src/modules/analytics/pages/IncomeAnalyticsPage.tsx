import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { businessApi } from '../../../api/api';
import { Loader } from '../../../shared/components/ui/Loader';
import { MOCK_INCOME_DATA } from '../../../mocks/analytics.mock';
import type {
  ValueType,
  NameType,
} from 'recharts/types/component/DefaultTooltipContent';

const formatCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', notation: 'compact' }).format(value);

const IncomeAnalyticsPage = () => {
  const [data, setData] = useState(MOCK_INCOME_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [periodoMeses, setPeriodoMeses] = useState(6);
  const [usandoMock, setUsandoMock] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: response } = await businessApi.get(`/boletos/analytics/ingresos?meses=${periodoMeses}`);
      if (response && response.length > 0) {
        setData(response);
        setUsandoMock(false);
      } else {
        setData(MOCK_INCOME_DATA.slice(-periodoMeses));
        setUsandoMock(true);
      }
    } catch {
      setData(MOCK_INCOME_DATA.slice(-periodoMeses));
      setUsandoMock(true);
    } finally {
      setIsLoading(false);
    }
  }, [periodoMeses]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPorMetodo = data.reduce(
    (acc, d) => ({
      Tarjeta: acc.Tarjeta + (d.Tarjeta || 0),
      Efectivo: acc.Efectivo + (d.Efectivo || 0),
      ePayco: acc.ePayco + (d.ePayco || 0),
    }),
    { Tarjeta: 0, Efectivo: 0, ePayco: 0 }
  );

  const handleExport = () => {
    const csv = ['Mes,Tarjeta,Efectivo,ePayco',
      ...data.map(d => `${d.mes},${d.Tarjeta || 0},${d.Efectivo || 0},${d.ePayco || 0}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ingresos_${periodoMeses}meses.csv`;
    a.click();
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            Ingresos por Método de Pago
          </h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Evolución mensual de ingresos por método de pago.
            {usandoMock && <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>· Datos de demostración</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Selector de período */}
          {[3, 6, 12].map(m => (
            <button key={m} onClick={() => setPeriodoMeses(m)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: periodoMeses === m ? '#6366f1' : 'rgba(255,255,255,0.05)', color: periodoMeses === m ? 'white' : '#94a3b8' }}>
              {m} meses
            </button>
          ))}
          <button onClick={handleExport} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>
            ↓ Exportar CSV
          </button>
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Tarjeta', value: totalPorMetodo.Tarjeta, color: '#6366f1' },
          { label: 'Efectivo', value: totalPorMetodo.Efectivo, color: '#10b981' },
          { label: 'ePayco', value: totalPorMetodo.ePayco, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}30`, borderRadius: '1rem', padding: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{label}</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color, marginTop: '0.25rem' }}>{formatCOP(value)}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>últimos {periodoMeses} meses</div>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem', height: '400px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Loader />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="mes" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={v => formatCOP(v)} />
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                formatter={(value: ValueType | undefined, name: NameType | undefined) => [
                  formatCOP(Number(Array.isArray(value) ? value[0] : value ?? 0)),
                  String(name ?? ''),
                ]}
              />
              <Legend />
              <Bar dataKey="Tarjeta" stackId="a" fill="#6366f1" name="Tarjeta" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Efectivo" stackId="a" fill="#10b981" name="Efectivo" />
              <Bar dataKey="ePayco" stackId="a" fill="#f59e0b" name="ePayco" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default IncomeAnalyticsPage;