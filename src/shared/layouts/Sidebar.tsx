import { NavLink } from "react-router-dom";
import { useAuthorization } from "../../features/roles/hooks/useAuthorization";
import { MODULES } from "../config/modules";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { canRead } = useAuthorization();

  const GROUPS = [
    {
      label: 'Administración',
      items: [
        { module: MODULES.USUARIOS, path: '/admin/usuarios', label: 'Usuarios' },
        { module: MODULES.ROLES, path: '/admin/roles', label: 'Roles' },
        { module: MODULES.EMPRESAS, path: '/admin/empresas', label: 'Empresas' },
      ]
    },
    {
      label: 'Operaciones',
      items: [
        { module: MODULES.BUSES, path: '/admin/buses', label: 'Buses' },
        { module: MODULES.CONDUCTORES, path: '/admin/conductores', label: 'Conductores' },
        { module: MODULES.RUTAS, path: '/rutas', label: 'Rutas' },
        { module: MODULES.PARADEROS, path: '/paraderos', label: 'Paraderos' },
        { module: MODULES.PROGRAMACIONES, path: '/admin/programaciones', label: 'Programaciones' },
        { module: MODULES.TURNOS, path: '/admin/turnos', label: 'Turnos' },
        { module: MODULES.INCIDENTES, path: '/admin/incidentes', label: 'Incidentes' },
      ]
    },
    {
      label: 'Comercial & Pasajeros',
      items: [
        { module: MODULES.CLIENTES, path: '/admin/clientes', label: 'Clientes' },
        { module: MODULES.BOLETOS, path: '/boletos', label: 'Boletos' },
        { module: MODULES.PAGOS, path: '/pagos', label: 'Pagos' },
        { module: MODULES.RECARGAS, path: '/recargas', label: 'Recargas' },
        { module: MODULES.VALIDACIONES, path: '/validaciones', label: 'Validaciones' },
      ]
    },
    {
      label: 'Social',
      items: [
        { module: MODULES.MENSAJES, path: '/mensajes', label: 'Mensajes' },
        { module: MODULES.GRUPOS, path: '/grupos', label: 'Grupos' },
        { module: MODULES.RESENAS, path: '/resenas', label: 'Reseñas' },
      ]
    }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">Buses Manizales</div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/perfil"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <span>Perfil</span>
        </NavLink>

        {GROUPS.map((group, groupIdx) => {
          const visibleItems = group.items.filter(item => canRead(item.module));
          if (visibleItems.length === 0) return null;

          return (
            <div key={groupIdx}>
              <div className="nav-group-label" style={{ padding: '1.5rem 1rem 0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {group.label}
              </div>
              {visibleItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
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
