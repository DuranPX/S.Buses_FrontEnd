import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIncidents } from '../hooks/useIncidents';
import { IncidentCard } from '../components/IncidentCard';
import { Loader } from '../../../shared/components/ui/Loader';

const IncidentsHistoryPage = () => {
  const { incidents, isLoading, error } = useIncidents(false); // false = user view
  const location = useLocation();
  const navigate = useNavigate();
  const showSuccessMsg = location.state?.success;

  useEffect(() => {
    if (showSuccessMsg) {
      // Limpiar state para que no vuelva a salir si recargan
      window.history.replaceState({}, document.title);
      // Podría usarse un toast aquí
    }
  }, [showSuccessMsg]);

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            Mis Reportes
          </h1>
          <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
            Historial de los incidentes que has reportado.
          </p>
        </div>
        <button 
          onClick={() => navigate('/incidentes/crear')}
          style={{ background: '#6366f1', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          + Nuevo Reporte
        </button>
      </div>

      {showSuccessMsg && (
        <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid rgba(16,185,129,0.2)' }}>
          ¡Reporte enviado exitosamente! Gracias por tu colaboración.
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
          <Loader />
        </div>
      ) : error ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
          {error}
        </div>
      ) : incidents.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🛡️</span>
          <h3 style={{ margin: '0 0 0.5rem', color: '#f8fafc' }}>No has reportado incidentes</h3>
          <p style={{ margin: 0 }}>Cuando reportes algo anormal, aparecerá aquí.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem', paddingBottom: '2rem' }}>
          {incidents.map(inc => (
            <IncidentCard key={inc.id} incident={inc} />
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentsHistoryPage;
