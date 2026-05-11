import { useNavigate } from 'react-router-dom';

const BusesPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            Gestión de Flota (Buses)
          </h1>
          <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
            Listado de buses y estado mecánico.
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin/buses/crear')}
          style={{ background: '#6366f1', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          + Registrar Bus
        </button>
      </div>

      <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🚌</span>
          <p>Listado de la flota. (Conectado a Buses Mock en el futuro)</p>
        </div>
      </div>
    </div>
  );
};

export default BusesPage;
