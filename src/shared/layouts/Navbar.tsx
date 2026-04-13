import { useAuth } from "../../features/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const { user, activeRole, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Abrir menú"
        >
          ☰
        </button>
      </div>
      
      <div className="navbar-right">
        <div className="user-profile-menu">
          <div 
            className="user-info" 
            style={{ textAlign: 'right', cursor: 'pointer' }}
            onClick={() => navigate('/perfil')}
            title="Ver perfil"
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name} {user?.lastName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeRole?.name}</div>
          </div>
          <div 
            className="avatar" 
            onClick={() => navigate('/perfil')}
            style={{ cursor: 'pointer', overflow: 'hidden' }}
            title="Ver perfil"
          >
            {user?.photo ? (
              <img 
                src={user.photo} 
                alt={user.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
              />
            ) : (
              (user?.name || "U")[0]
            )}
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
