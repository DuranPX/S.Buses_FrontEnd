import type { ProgramacionPublica } from '../types/schedule.types';

interface Props {
  schedule: ProgramacionPublica;
}

const estadoStyle = (estado: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    Programado: { bg: 'rgba(99,102,241,0.1)',  color: '#a5b4fc' },
    En_Curso:   { bg: 'rgba(52,211,153,0.1)',  color: '#34d399' },
  };
  return map[estado] ?? { bg: 'rgba(255,255,255,0.05)', color: '#94a3b8' };
};

const recurrenciaLabel: Record<string, string> = {
  Diaria:     '📅 Diaria',
  Laboral:    '💼 Laboral',
  Fin_Semana: '🏖️ Fin de semana',
};

export const ScheduleCard = ({ schedule: p }: Props) => {
  const cuposDisponibles = (p.bus?.capacidad_total ?? 0) - p.pasajeros_actuales;
  const sinCupos = cuposDisponibles <= 0;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${sinCupos ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '1rem', padding: '1.25rem',
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
    }}>

      {/* Info ruta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>
            {p.ruta?.codigo} — {p.ruta?.nombre}
          </span>
          <span style={{
            background: estadoStyle(p.estado).bg,
            color: estadoStyle(p.estado).color,
            padding: '0.2rem 0.6rem', borderRadius: '999px',
            fontSize: '0.75rem', fontWeight: 600,
            border: `1px solid ${estadoStyle(p.estado).color}`,
          }}>
            {p.estado.replace('_', ' ')}
          </span>
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          <span>🚌 {p.bus?.placa}</span>
          <span>🕐 Salida: <strong style={{ color: '#f8fafc' }}>{p.hora_salida}</strong></span>
          <span>📆 {new Date(p.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <span>{recurrenciaLabel[p.tipo_recurrencia] ?? p.tipo_recurrencia}</span>
        </div>
      </div>

      {/* Cupos */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: sinCupos ? '#ef4444' : '#f8fafc' }}>
          {sinCupos ? 'Lleno' : cuposDisponibles}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {sinCupos ? 'sin cupos' : 'cupos disponibles'}
        </div>
      </div>

    </div>
  );
};