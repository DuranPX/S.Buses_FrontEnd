import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { logout as logoutService, selectRole } from "../services/auth.service";
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

export interface AuthExternal {
  proveedor: string;
  email: string;
}

export interface User {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  photo?: string;
  roles: Role[];
  authExternals?: AuthExternal[];
}

interface AuthContextType {
  user: User | null;
  activeRole: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showRoleModal: boolean;
  syncSession: (token: string, email?: string, explicitRole?: any, explicitUser?: any) => Promise<void>;
  logout: () => void;
  setActiveRole: (role: Role) => void;
  setShowRoleModal: (show: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { clearAuthFlow } = useAuthFlow();
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleSetActiveRole = (role: Role) => {
    setActiveRole(role);
    localStorage.setItem("activeRole", role.id);
    setShowRoleModal(false);
  };

  const decodeJWT = (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const syncSession = async (token: string, fallbackEmail?: string, explicitRole?: any, explicitUser?: any) => {
    const payload = decodeJWT(token);
    if (!payload) return;

    // ID Resolution: Prioritize 'user_id' from JWT, then check object/fallback
    const userId = payload.user_id || payload._id || payload.id || explicitUser?.id || explicitUser?._id || user?.id;

    if (!userId || userId === "user-1") {
      console.warn("SyncSession: No se pudo resolver un ID de usuario válido desde el token o el estado previo.");
    }

    const email = explicitUser?.email || payload?.subject || payload?.sub || fallbackEmail || user?.email || "";
    const name = explicitUser?.name || payload?.name || user?.name || email.split("@")[0];
    const lastName = explicitUser?.lastName || payload?.lastName || user?.lastName || "";
    const photo = explicitUser?.photo || payload?.photo || user?.photo || null;
    
    // IMPORTANTE: No sobreescribir con vacío si el dato ya existe en memoria o en el objeto explícito
    const phone = explicitUser?.phone || user?.phone || "";
    const address = explicitUser?.address || user?.address || "";
    const authExternals = explicitUser?.authExternals || user?.authExternals || [];
    
    const tokenType = payload?.token_type;

    if (tokenType === "general") {
      // 1. TOKEN TEMPORAL ESPERANDO SELECCIÓN DE ROL
      const rawRoles: string[] = payload?.roles || [];
      
      const draftRoles: Role[] = rawRoles.map((r: string) => ({
        id: `role-${r.toLowerCase()}`,
        name: r,
        description: `Perfil detectado`,
        activo: true,
        permisos: []
      }));

      setUser({ id: userId || "user-1", name, lastName, email, phone, address, photo, roles: draftRoles, authExternals });
      setActiveRole(null);

      if (rawRoles.length === 1) {
        try {
          const result = await selectRole(rawRoles[0]);
          if (result && result.token && result.role) {
            // Pasamos el usuario actual completo a la siguiente fase para no perder datos parciales
            return await syncSession(result.token, email, result.role, { id: userId, name, lastName, email, phone, address, photo, authExternals });
          }
        } catch (error) {
          handleSetActiveRole(draftRoles[0]);
        }
      }

    } else if (tokenType === "auth_role" || explicitRole) {
      // 2. TOKEN DEFINITIVO
      const backendRole = explicitRole;
      
      const roleObj: Role = backendRole ? {
        id: backendRole.id || backendRole._id || `role-${backendRole.nombre?.toLowerCase() || 'default'}`,
        name: backendRole.nombre || backendRole.name || "ROLE",
        description: backendRole.descripcion || backendRole.description || "Perfil activo",
        activo: backendRole.activo ?? true,
        permisos: backendRole.permisos || []
      } : {
        id: "role-default",
        name: "USUARIO",
        description: "Acceso Básico",
        activo: true,
        permisos: []
      };

      setUser({ id: userId || "user-1", name, lastName, email, phone, address, photo, roles: [roleObj], authExternals });
      handleSetActiveRole(roleObj);
    } else {
      // Compatibility fallback
      const rawRoles = payload?.roles || ["USER"];
      const fallbackRole: Role = {
        id: `role-${rawRoles[0].toLowerCase()}`,
        name: rawRoles[0].toUpperCase(),
        description: `Acceso`,
        activo: true,
        permisos: []
      };

      setUser({ id: userId || "user-1", name, lastName, email, phone, address, photo, roles: [fallbackRole], authExternals });
      handleSetActiveRole(fallbackRole);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (token) {
        const payload = decodeJWT(token);
        if (payload?.token_type === "auth_role") {
          try {
            // Rehidratar la memoria remotamente via API en pro del POLP
            const { getMe } = await import("../services/auth.service");
            const sessionData = await getMe();
            await syncSession(token, undefined, sessionData.role, sessionData.user);
          } catch(err) {
            console.error("Error validando sesión:", err);
            // Fallback si la session venció
            setUser(null);
            setActiveRole(null);
          }
        } else {
          // Token Temporal normal
          await syncSession(token);
        }
      } else {
        setUser(null);
        setActiveRole(null);
      }
      setIsLoading(false);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    clearAuthFlow();
    setUser(null);
    setActiveRole(null);
    localStorage.removeItem("activeRole");
    // El servicio de logout se encarga de llamar al backend y limpiar localStorage
    logoutService();
  };

  /** Actualiza parcialmente el usuario en memoria (usado por perfil, desvinculación OAuth, etc.) */
  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const value = {
    user,
    activeRole,
    isAuthenticated: !!user,
    isLoading,
    showRoleModal,
    syncSession,
    logout,
    setActiveRole: handleSetActiveRole,
    setShowRoleModal,
    updateUser
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
