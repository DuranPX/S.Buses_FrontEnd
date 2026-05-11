import type { RouteFilters } from '../types/route.types';

interface Props {
  filters: RouteFilters;
  onChange: (f: Partial<RouteFilters>) => void;
}

export const RouteFiltersBar = ({ filters, onChange }: Props) => (
  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
      <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
        🔍
      </span>
      <input
        id="route-search"
        type="text"
        placeholder="Buscar por nombre o código..."
        value={filters.search}
        onChange={e => onChange({ search: e.target.value })}
        style={{
          width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.2rem',
          borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)', color: 'inherit',
          fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>

    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', userSelect: 'none' }}>
      <input
        id="route-filter-active"
        type="checkbox"
        checked={filters.soloActivas}
        onChange={e => onChange({ soloActivas: e.target.checked })}
        style={{ accentColor: '#6366f1', width: '1rem', height: '1rem' }}
      />
      Solo activas
    </label>
  </div>
);
