import { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Sector } from 'recharts';
import { businessApi } from '../../../api/api';
import { Loader } from '../../../shared/components/ui/Loader';
import { MOCK_AGE_DATA } from '../../../mocks/analytics.mock';

interface AgeSegment { name: string; value: number; porcentaje: number; color: string; }

const AgeAnalyticsPage = () => {
  const [data, setData] = useState<AgeSegment[]>(MOCK_AGE_DATA.map((d) => ({ ...d, porcentaje: 0 })));
  const [isLoading, setIsLoading] = useState(true);
  const [, setActiveIndex] = useState<number | null>(null);
  const [usandoMock, setUsandoMock] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: response } = await businessApi.get('/ciudadano/analiticas/rango-etario');
      if (response && response.length > 0 && response.some((d: AgeSegment) => d.value > 0)) {
        setData(response);
        setUsandoMock(false);
      } else {
        setData(MOCK_AGE_DATA.map(d => ({ ...d, porcentaje: Math.round(d.value) })));
        setUsandoMock(true);
      }
    } catch {
      setData(MOCK_AGE_DATA.map(d => ({ ...d, porcentaje: Math.round(d.value) })));
      setUsandoMock(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const total = data.reduce((s, d) => s + d.value, 0);
  const segmentoPredominante = data.reduce((max, d) => d.value > max.value ? d : max, data[0]);

  const handleExportCSV = () => {
    const csv = ['Rango,Pasajeros,Porcentaje',
      ...data.map(d => `${d.name},${d.value},${d.porcentaje}%`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'distribucion_etaria.csv'; a.click();
  };

  const handleExportPNG = () => {
    const svg = document.querySelector('.recharts-wrapper svg') as SVGElement;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 400;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 600, 400);
    const img = new Image();
    img.onload = () => { ctx.drawImage(img, 0, 0); canvas.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b!); a.download = 'distribucion_etaria.png'; a.click(); }); };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgStr);
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
    return (
      <g>
        <text x={cx} y={cy - 10} textAnchor="middle" fill="#f8fafc" fontSize={14} fontWeight={700}>{payload.name}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill={fill} fontSize={20} fontWeight={700}>{payload.value.toLocaleString()}</text>
        <text x={cx} y={cy + 36} textAnchor="middle" fill="#94a3b8" fontSize={12}>pasajeros</text>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 10} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      </g>
    );
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            Distribución Etaria de Pasajeros
          </h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Segmentación de pasajeros por rango de edad.
            {usandoMock && <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>· Datos de demostración</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleExportPNG} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>
            ↓ PNG
          </button>
          <button onClick={handleExportCSV} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>
            ↓ Excel/CSV
          </button>
        </div>
      </div>

      {/* Segmento predominante */}
      {segmentoPredominante && (
        <div style={{ background: `${segmentoPredominante.color}15`, border: `1px solid ${segmentoPredominante.color}40`, borderRadius: '1rem', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>👑</span>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Segmento Predominante</span>
            <div style={{ fontWeight: 700, color: segmentoPredominante.color, fontSize: '1.1rem' }}>
              {segmentoPredominante.name} — {segmentoPredominante.porcentaje}% del total ({segmentoPredominante.value.toLocaleString()} pasajeros)
            </div>
          </div>
        </div>
      )}

      {/* Gráfico */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem', height: '380px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Loader /></div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie<any>
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={90}
                outerRadius={140}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                activeShape={renderActiveShape}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                formatter={(value, name) => {
                  const numericValue = Array.isArray(value) ? value[0] : value ?? 0;

                  return [
                    `${Number(numericValue).toLocaleString()} pasajeros`,
                    String(name ?? ''),
                  ];
                }}
              />
              <Legend verticalAlign="bottom" height={40} formatter={(value) => <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tabla resumen */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>RANGO ETARIO</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>PASAJEROS</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>PORCENTAJE</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                  <span style={{ color: '#f8fafc', fontWeight: 500 }}>{row.name}</span>
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#cbd5e1' }}>{row.value.toLocaleString()}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                  <span style={{ color: row.color, fontWeight: 600 }}>{row.porcentaje}%</span>
                </td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
              <td style={{ padding: '0.75rem 1rem', color: '#f8fafc', fontWeight: 700 }}>Total</td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#f8fafc', fontWeight: 700 }}>{total.toLocaleString()}</td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#f8fafc', fontWeight: 700 }}>100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgeAnalyticsPage;