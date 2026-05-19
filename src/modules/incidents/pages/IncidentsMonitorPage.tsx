import { useState, useMemo } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { IncidentCard } from '../components/IncidentCard';
import { Loader } from '../../../shared/components/ui/Loader';
import { incidentsService } from '../services/incidentsService';
import type { TipoIncidente } from '../types/incident.types';

// ── Paleta por tipo ──────────────────────────────────────────────
const tipoMeta: Record<TipoIncidente, { emoji: string; color: string; bg: string }> = {
  'Mecánico':  { emoji: '', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  'Accidente': { emoji: '', color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  'Retraso':   { emoji: '', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  'Otro':      { emoji: '', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)'},
};

// ── Sub-componente: tarjeta de stat ──────────────────────────────
const StatCard = ({
  label, value, sub, color, bg, emoji,
}: {
  label: string; value: string | number; sub?: string;
  color: string; bg: string; emoji: string;
}) => (
  <div style={{
    background: bg,
    border: `1px solid ${color}30`,
    borderRadius: '0.875rem',
    padding: '1rem 1.25rem',
    display: 'flex', alignItems: 'center', gap: '0.85rem',
    minWidth: 0,
  }}>
    <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{emoji}</span>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '1.45rem', fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: '0.72rem', color, marginTop: '0.1rem', fontWeight: 600 }}>
          {sub}
        </div>
      )}
    </div>
  </div>
);

// ── Barra de progreso ────────────────────────────────────────────
const ProgressBar = ({ pct, color }: { pct: number; color: string }) => (
  <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
    <div style={{
      height: '100%', width: `${pct}%`,
      background: color, borderRadius: '999px',
      transition: 'width 0.4s ease',
    }} />
  </div>
);

// ════════════════════════════════════════════════════════════════
const IncidentsMonitorPage = () => {
  const { incidents, isLoading, error, refetch } = useIncidents(true);
  const [filter, setFilter]       = useState<string>('Todos');
  const [busFilter, setBusFilter] = useState<string>('Todos');

  const handleStatusChange = async (id: string, newStatus: any) => {
    try {
      await incidentsService.updateEstado(id, newStatus);
      refetch();
    } catch (err) {
      console.error(err);
      alert('Error al actualizar estado');
    }
  };

  // ── Estadísticas globales (sobre TODOS los incidentes) ─────────
  const stats = useMemo(() => {
    const total    = incidents.length;
    const resueltos = incidents.filter(i => i.estado === 'Resuelto').length;
    const tasa     = total > 0 ? Math.round((resueltos / total) * 100) : 0;

    const porTipo = (Object.keys(tipoMeta) as TipoIncidente[]).map(tipo => ({
      tipo,
      count: incidents.filter(i => i.tipo === tipo).length,
      pct:   total > 0
        ? Math.round((incidents.filter(i => i.tipo === tipo).length / total) * 100)
        : 0,
    }));

    return { total, resueltos, tasa, porTipo };
  }, [incidents]);

  // ── Buses disponibles ──────────────────────────────────────────
  const availableBuses = useMemo(() => {
    const placas = new Set<string>();
    incidents.forEach(inc =>
      inc.incidenteBuses?.forEach(ib => { if (ib.bus?.placa) placas.add(ib.bus.placa); })
    );
    return Array.from(placas).sort();
  }, [incidents]);

  // ── Incidentes filtrados (para la grilla) ──────────────────────
  const filteredIncidents = useMemo(() => incidents.filter(inc => {
    const matchesStatus =
      filter === 'Todos' ||
      (filter === 'Pendientes'
        ? inc.estado === 'Pendiente' || inc.estado === 'En_Revision'
        : inc.estado === filter);
    const matchesBus =
      busFilter === 'Todos' ||
      inc.incidenteBuses?.some(ib => ib.bus?.placa === busFilter);
    return matchesStatus && matchesBus;
  }), [incidents, filter, busFilter]);

  return (
    <div style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── ENCABEZADO ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem', color: '#f8fafc', margin: 0 }}>
            Monitor de Incidentes
          </h1>
          <p style={{ color: '#94a3b8', margin: '0.35rem 0 0' }}>
            Centro de control y gestión en tiempo real.
          </p>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Estado */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '0.5rem' }}>
            {['Todos', 'Pendientes', 'Resuelto'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: filter === f ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: filter === f ? '#f8fafc' : '#94a3b8',
                border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem',
                cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s ease',
              }}>{f}</button>
            ))}
          </div>

          {/* Bus */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '0.65rem', fontSize: '0.85rem', pointerEvents: 'none', zIndex: 1 }}>🚌</span>
            <select value={busFilter} onChange={e => setBusFilter(e.target.value)} style={{
              background: 'rgba(0,0,0,0.2)',
              color: busFilter !== 'Todos' ? '#f8fafc' : '#94a3b8',
              border: busFilter !== 'Todos' ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)',
              padding: '0.5rem 1.5rem 0.5rem 2rem', borderRadius: '0.5rem',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
              appearance: 'none', WebkitAppearance: 'none', outline: 'none', minWidth: '140px',
            }}>
              <option value="Todos">Todos los buses</option>
              {availableBuses.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <span style={{ position: 'absolute', right: '0.65rem', fontSize: '0.7rem', color: '#94a3b8', pointerEvents: 'none' }}>▼</span>
          </div>

          {(filter !== 'Todos' || busFilter !== 'Todos') && (<>
            <span style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '999px', padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 600 }}>
              {filteredIncidents.length} resultado{filteredIncidents.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => { setFilter('Todos'); setBusFilter('Todos'); }}
              style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
            >✕ Limpiar</button>
          </>)}
        </div>
      </div>

      {/* ── ESTADÍSTICAS ───────────────────────────────────────── */}
      {!isLoading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>

          {/* Total */}
          <StatCard
            emoji="📊" label="Total de incidentes" value={stats.total}
            sub={`${stats.resueltos} resueltos · ${stats.total - stats.resueltos} activos`}
            color="#a5b4fc" bg="rgba(99,102,241,0.1)"
          />

          {/* Tasa de resolución */}
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '0.875rem', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem' }}>✅</span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Tasa de resolución</span>
              </div>
              <span style={{ fontSize: '1.45rem', fontWeight: 700, color: '#10b981' }}>{stats.tasa}%</span>
            </div>
            <ProgressBar pct={stats.tasa} color="#10b981" />
            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
              {stats.resueltos} de {stats.total} incidente{stats.total !== 1 ? 's' : ''} resuelto{stats.resueltos !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Por tipo — ocupa el resto del ancho disponible */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.875rem', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
              <span style={{ fontSize: '1rem' }}>📂</span>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Incidentes por tipo</span>
            </div>
            {stats.porTipo.map(({ tipo, count, pct }) => {
              const meta = tipoMeta[tipo];
              return (
                <div key={tipo} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                      {meta.emoji} {tipo}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: meta.color }}>
                      {count} <span style={{ fontWeight: 400, color: '#64748b' }}>({pct}%)</span>
                    </span>
                  </div>
                  <ProgressBar pct={pct} color={meta.color} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── GRILLA DE INCIDENTES ───────────────────────────────── */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Loader />
        </div>
      ) : error ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
          {error}
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>
            {busFilter !== 'Todos' ? '🚌' : '✅'}
          </span>
          <h3 style={{ margin: '0 0 0.5rem', color: '#f8fafc' }}>
            {busFilter !== 'Todos' ? `Sin incidentes para ${busFilter}` : 'Todo bajo control'}
          </h3>
          <p style={{ margin: 0 }}>No hay incidentes reportados para este filtro.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem', overflowY: 'auto', paddingBottom: '2rem' }}>
          {filteredIncidents.map(inc => (
            <IncidentCard key={inc.id} incident={inc} isAdmin={true} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentsMonitorPage;