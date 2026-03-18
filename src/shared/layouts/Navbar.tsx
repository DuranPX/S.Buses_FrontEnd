import { useAuth } from "../../features/auth/hooks/useAuth";

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="breadcrumb">Admin / <span style={{ color: 'white' }}>Dashboard</span></span>
      </div>
      
      <div className="navbar-right">
        <div className="user-profile-menu">
          <div className="user-info" style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name || "Usuario"}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role || "GUEST"}</div>
          </div>
          <div className="avatar">
            {(user?.name || "U")[0]}
          </div>
          <button 
            onClick={logout}
            className="btn-ghost btn-sm"
            style={{ marginLeft: '0.5rem' }}
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
