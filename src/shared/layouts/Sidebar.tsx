import { NavLink } from "react-router-dom";
import { useAuthorization } from "../../features/roles/hooks/useAuthorization";
import { MODULES } from "../config/modules";

export const Sidebar = () => {
  const { canRead } = useAuthorization();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">Buses Manizales</div>
      </div>

      <nav className="sidebar-nav">
        {canRead(MODULES.DASHBOARD) && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
        )}

        {canRead(MODULES.ROLES) && (
          <NavLink
            to="/admin/roles"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🛡️</span>
            <span>Roles & Permisos</span>
          </NavLink>
        )}

        {(canRead(MODULES.BUSES) || canRead(MODULES.RUTAS)) && (
          <div className="nav-group-label" style={{ padding: '1.5rem 1rem 0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Gestión
          </div>
        )}

        {canRead(MODULES.BUSES) && (
          <NavLink
            to="/buses"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🚌</span>
            <span>Buses</span>
          </NavLink>
        )}

        {canRead(MODULES.RUTAS) && (
          <NavLink
            to="/admin/rutas"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🗺️</span>
            <span>Rutas</span>
          </NavLink>
        )}

        {canRead(MODULES.USUARIOS) && (
          <div className="nav-group-label" style={{ padding: '1.5rem 1rem 0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Sistema
          </div>
        )}

        {canRead(MODULES.USUARIOS) && (
          <NavLink
            to="/admin/usuarios"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">👥</span>
            <span>Usuarios</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer" style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="glass" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Pro Plan</p>
          <p style={{ fontWeight: 600 }}>Ilimitado</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
