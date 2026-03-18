import { NavLink } from "react-router-dom";

export const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">Buses Manizales</div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">📊</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/roles"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">🛡️</span>
          <span>Roles & Permisos</span>
        </NavLink>

        <div className="nav-group-label" style={{ padding: '1.5rem 1rem 0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Gestión
        </div>

        <NavLink
          to="/buses"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">🚌</span>
          <span>Buses</span>
        </NavLink>

        <NavLink
          to="/routes"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">🗺️</span>
          <span>Rutas</span>
        </NavLink>
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
