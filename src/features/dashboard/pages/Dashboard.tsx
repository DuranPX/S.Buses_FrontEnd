import { useAuthorization } from "../../roles/hooks/useAuthorization";
import { MODULES } from "../../../shared/config/modules";
import { FormCard } from "../../../shared/components/cards/FormCard";

export const Dashboard = () => {
  const { canRead, activeRole } = useAuthorization();

  if (!activeRole) return null;

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Dashboard Principal</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Bienvenido, estas conectado con el rol: <strong style={{ color: 'var(--accent-color)' }}>{activeRole.name}</strong>
        </p>
      </header>

      <div className="dashboard-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
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
