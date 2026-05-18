import { useAuthorization } from "../../roles/hooks/useAuthorization";
import { MODULES } from "../../../shared/config/modules";
import { FormCard } from "../../../shared/components/cards/FormCard";
import { useWallet } from "../../../modules/wallet/context/WalletContext";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const { canRead, activeRole } = useAuthorization();
  const { saldoActual, billeteraPrincipal, isLoadingWallet } = useWallet();
  const navigate = useNavigate();

  if (!activeRole) return null;

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Dashboard Principal</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Bienvenido, estas conectado con el rol: <strong style={{ color: 'var(--accent-color)' }}>{activeRole.name}</strong>
          </p>
        </div>

        {canRead(MODULES.CARTERA) && (
          <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', padding: '0.75rem 1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>💳</span>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', fontWeight: 600 }}>Mi Billetera Virtual</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                ${saldoActual.toLocaleString('es-CO')}
              </span>
            </div>
            <button 
              onClick={() => navigate('/cartera/recarga')} 
              style={{ background: '#34d399', color: '#0f172a', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Recargar
            </button>
          </div>
        )}
      </header>

      <div className="dashboard-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {canRead(MODULES.CARTERA) && (
          <FormCard title="Mi Billetera Virtual">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Consulta tu saldo disponible, recarga tu cuenta y gestiona tus métodos de pago.
            </p>
            <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Saldo Disponible</span>
              {isLoadingWallet ? (
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#94a3b8' }}>Cargando...</div>
              ) : (
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#34d399' }}>
                  ${saldoActual.toLocaleString('es-CO')}
                </div>
              )}
              {billeteraPrincipal?.metodoPago && (
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.5rem', fontWeight: 600 }}>
                  🏷️ {billeteraPrincipal.metodoPago.descripcion || billeteraPrincipal.metodoPago.tipo}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => navigate('/cartera/recarga')} 
                style={{ flex: 1, padding: '0.8rem', background: '#6366f1', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
              >
                + Recargar Saldo
              </button>
              <button 
                onClick={() => navigate('/abordaje')} 
                style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}
              >
                🚌 Abordar Bus
              </button>
            </div>
          </FormCard>
        )}

        {canRead(MODULES.ROLES) && (
          <FormCard title="Roles y Permisos">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Gestiona el acceso al sistema y las capacidades de los usuarios.
            </p>
            <div style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Acceso habilitado</div>
          </FormCard>
        )}

        {canRead(MODULES.BUSES) && (
          <FormCard title="Gestión de Buses">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Controla la flota de buses, sus mantenimientos y estados.
            </p>
            <div style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Acceso habilitado</div>
          </FormCard>
        )}

        {canRead(MODULES.RUTAS) && (
          <FormCard title="Rutas y Paradas">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Configura los recorridos y puntos de parada autorizados.
            </p>
            <div style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Acceso habilitado</div>
          </FormCard>
        )}

        {canRead(MODULES.USUARIOS) && (
          <FormCard title="Usuarios">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Administra las cuentas de usuario y perfiles personales.
            </p>
            <div style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Acceso habilitado</div>
          </FormCard>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
