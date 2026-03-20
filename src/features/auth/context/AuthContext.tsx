import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { login as loginService, logout as logoutService } from "../services/auth.service";
import mockRoles from "../../roles/data/mockRoles.json";
import mockUsers from "../data/mockUsers.json";
import { useAuthFlow } from "./AuthFlowContext";

export interface Permission {
  modulo: string;
  leer: boolean;
  escribir: boolean;
  editar: boolean;
  eliminar: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  activo: boolean;
  permisos: Permission[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
}

interface AuthContextType {
  user: User | null;
  activeRole: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showRoleModal: boolean;
  login: (data: any) => Promise<void>;
  logout: () => void;
  setActiveRole: (role: Role) => void;
  setShowRoleModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { clearAuthFlow } = useAuthFlow();
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Helper para resolver los IDs de rol a objetos completos (usando datos simulados por ahora)
  const resolveRoles = useCallback((roleIds: string[]): Role[] => {
    return roleIds
      .map(id => (mockRoles as Role[]).find(r => r.id === id))
      .filter((r): r is Role => !!r);
  }, []);

  const handleSetActiveRole = (role: Role) => {
    setActiveRole(role);
    localStorage.setItem("activeRole", role.id);
    setShowRoleModal(false);
  };

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem("token");
      const storedRoleId = localStorage.getItem("activeRole");

      if (token) {
        // Solo si TENEMOS un token, intentamos restaurar la sesión (simulando por ahora)
        const mockUserRaw = mockUsers[0]; // O buscar en la API real más tarde
        const roles = resolveRoles(mockUserRaw.roles);
        const initializedUser: User = { ...mockUserRaw, roles };
        
        setUser(initializedUser);

        if (roles.length > 0) {
          const roleFromStorage = roles.find(r => r.id === storedRoleId);
          if (roleFromStorage && roleFromStorage.activo) {
            setActiveRole(roleFromStorage);
          } else if (roles.length === 1) {
            handleSetActiveRole(roles[0]);
          } else {
            setActiveRole(null);
          }
        }
      } else {
        // No token -> No user (flujo manual )
        setUser(null);
        setActiveRole(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, [resolveRoles]);

  const login = async (data: any) => {
    await loginService(data);
    
    const userMatch = mockUsers.find(u => u.email === data.email);
    const mockUserRaw = userMatch || mockUsers[0];
    const roles = resolveRoles(mockUserRaw.roles);
    const loggedUser: User = { ...mockUserRaw, roles };

    setUser(loggedUser);

    if (roles.length === 1) {
      handleSetActiveRole(roles[0]);
    } else if (roles.length > 1) {
      // Fuerza la selección del rol
      setActiveRole(null);
      localStorage.removeItem("activeRole");
    } else {
      // caso de uso, el usuario no tiene roles, se le asigna un rol por defecto en la aplicacion sera el de pasajero
      const defaultRole = (mockRoles as Role[]).find(r => r.id === 'role-guest') || (mockRoles as Role[])[0];
      handleSetActiveRole(defaultRole);
    }
  };

  const logout = () => {
    logoutService();
    clearAuthFlow();
    setUser(null);
    setActiveRole(null);
    localStorage.removeItem("activeRole");
  };

  const value = {
    user,
    activeRole,
    isAuthenticated: !!user,
    isLoading,
    showRoleModal,
    login,
    logout,
    setActiveRole: handleSetActiveRole,
    setShowRoleModal
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  return context;
};
