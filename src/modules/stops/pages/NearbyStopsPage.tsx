import { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useNearbyStops } from '../hooks/useNearbyStops';
import { NearbyStopsMap } from '../components/NearbyStopsMap';
import { StopsSidebar } from '../components/StopsSidebar';
import { Loader } from '../../../shared/components/ui/Loader';

const NearbyStopsPage = () => {
  const { location, error: geoError, isLoading: loadingGeo } = useGeolocation();
  const { stops, loading: loadingStops, error: stopsError } = useNearbyStops(location);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  // Seleccionar el primer paradero por defecto si hay paraderos y no hay ninguno seleccionado
  useEffect(() => {
    if (stops.length > 0 && !selectedStopId) {
      setSelectedStopId(stops[0].id);
    }
  }, [stops, selectedStopId]);

  if (loadingGeo || (loadingStops && location)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '60vh' }}>
        <Loader />
        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>
          {loadingGeo ? 'Obteniendo tu ubicación...' : 'Buscando paraderos cercanos...'}
        </p>
      </div>
    );
  }

  const error = geoError || stopsError;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', padding: '1rem', gap: '1.5rem', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>📍 Paraderos Cercanos</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
          Descubre dónde abordar y los buses que se aproximan en tiempo real.
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          {error instanceof Error ? error.message : error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Lista Lateral */}
        <div style={{ width: '320px', flexShrink: 0 }}>
          {stops.length > 0 ? (
            <StopsSidebar 
              stops={stops} 
              selectedStopId={selectedStopId} 
              onStopSelect={setSelectedStopId} 
            />
          ) : (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 1rem' }}>
              No se encontraron paraderos en un radio de 2km.
            </div>
          )}
        </div>

        {/* Mapa */}
        <div style={{ flex: 1, borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
          <NearbyStopsMap 
            stops={stops} 
            location={location} 
            onStopClick={setSelectedStopId}
          />
        </div>
      </div>
    </div>
  );
};

export default NearbyStopsPage;
