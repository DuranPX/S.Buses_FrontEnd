import { useRoutes } from '../hooks/useRoutes';
import { RouteCard } from '../components/RouteCard';
import { RouteFiltersBar } from '../components/RouteFilters';
import { Loader } from '../../../shared/components/ui/Loader';

const RoutesPage = () => {
  const { routes, isLoading, error, filters, setFilters } = useRoutes();

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
          Rutas Disponibles
        </h1>
        <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
          Explora todas las rutas de la ciudad, sus paraderos y tarifas.
        </p>
      </div>

      <RouteFiltersBar filters={filters} onChange={f => setFilters(prev => ({ ...prev, ...f }))} />

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
          <Loader />
        </div>
      ) : error ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
          {error}
        </div>
      ) : routes.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 1rem' }}>
          No se encontraron rutas que coincidan con tu búsqueda.
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem',
          paddingBottom: '2rem'
        }}>
          {routes.map(route => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RoutesPage;
