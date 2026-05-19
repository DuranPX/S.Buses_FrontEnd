import { NavLink } from "react-router-dom";
import { useAuthorization } from "../../features/roles/hooks/useAuthorization";
import { MODULES } from "../config/modules";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { canRead, activeRole } = useAuthorization();

  /**
   * Bloqueos temporales de módulos incompletos
   */
  const isTemporarilyBlocked = (module: string) => {
    const roleName = activeRole?.name?.toUpperCase();

    // Restricciones para CONDUCTOR
    if (roleName === 'CONDUCTOR') {
      const blockedModules = [
        MODULES.TURNOS,
        MODULES.PROGRAMACIONES,
      ];

      return blockedModules.includes(module as any);
    }

    return false;
  };

  const GROUPS = [
    {
      label: 'Administración',
      items: [
        { module: MODULES.USUARIOS, path: '/admin/usuarios', label: 'Usuarios' },
        { module: MODULES.ROLES, path: '/admin/roles', label: 'Roles' },
        { module: MODULES.RUTAS, path: '/admin/rutas', label: 'Gestión de Rutas' },
        { module: MODULES.PARADEROS, path: '/admin/paraderos', label: 'Gestión de Paraderos' },
        { module: MODULES.EMPRESAS, path: '/admin/empresas', label: 'Empresas' },
      ]
    },

    {
      label: 'Servicios',
      items: [
        { module: MODULES.RUTAS, path: '/rutas', label: 'Mapa de Rutas' },
        { module: MODULES.PARADEROS, path: '/paradero', label: 'Paraderos Cercanos' },
        { module: MODULES.BUSES, path: '/admin/buses', label: 'Buses' },
        { module: MODULES.CONDUCTORES, path: '/admin/conductores', label: 'Conductores' },

        // BLOQUEADOS temporalmente para conductor
        { module: MODULES.TURNOS, path: '/admin/turnos', label: 'Turnos' },
        { module: MODULES.PROGRAMACIONES, path: '/admin/programaciones', label: 'Programaciones' },

        // ESTE sí queda visible
        { module: MODULES.INCIDENTES, path: '/admin/incidentes', label: 'Monitor de Incidentes' },
      ]
    },

    {
      label: 'Mi Turno',
      items: [
        { module: MODULES.TURNO_CONDUCTOR, path: '/conductor/turno', label: 'Turno Actual' },
        { module: MODULES.INCIDENTES, path: '/incidentes/crear', label: 'Reportar Incidente' },
      ]
    },

    {
      label: 'Mis Viajes',
      items: [
        { module: MODULES.BOLETOS, path: '/abordaje', label: 'Abordar Bus' },
        { module: MODULES.BOLETOS, path: '/boletos', label: 'Mis Boletos' },
        { module: MODULES.VIAJES, path: '/viajes/historial', label: 'Historial' },
        { module: MODULES.CARTERA, path: '/cartera/recarga', label: 'Mi Cartera' },
      ]
    },

    {
      label: 'Analíticas',
      items: [
        { module: MODULES.ANALITICAS, path: '/analiticas/ingresos', label: 'Ingresos' },
        { module: MODULES.ANALITICAS, path: '/analiticas/rango-etario', label: 'Rango Etario' },
        { module: MODULES.ANALITICAS, path: '/analiticas/incidentes', label: 'Incidentes' },
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

          if (
            group.label === 'Administración' &&
            activeRole?.name !== 'Admin' &&
            activeRole?.name !== 'ADMIN'
          ) {
            return null;
          }

          const visibleItems = group.items.filter(item => {
            return (
              canRead(item.module) &&
              !isTemporarilyBlocked(item.module)
            );
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={groupIdx}>
              <div
                className="nav-group-label"
                style={{
                  padding: '1.5rem 1rem 0.5rem',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                {group.label}
              </div>

              {visibleItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                  onClick={onClose}
                >
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;