import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { logout as logoutService, selectRole, syncBusinessUser } from "../services/auth.service";
import { useAuthFlow } from "./AuthFlowContext";
import { businessApi } from "../../../api/api";
import { synchronizeRolePermissions } from "../../roles/utils/permissionUtils";
import { permissionStore } from "../../roles/utils/permissionStore";

const DriverLicenseModal = ({ personaId, onSuccess, onClose }: { personaId: string; onSuccess: (conductorId: string) => void; onClose: () => void }) => {
  const [licencia, setLicencia] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licencia || licencia.trim().length < 4) {
      setError('Por favor ingresa un número de licencia válido (mínimo 4 caracteres).');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await businessApi.post('/conductor', {
        personaId,
        licencia: licencia.trim(),
        activo: true
      });
      onSuccess(res.data?.id);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Error al registrar la licencia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', padding: '2.5rem', maxWidth: '480px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚌</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>¡Bienvenido Conductor!</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Para completar tu perfil operativo y poder recibir la asignación de tu empresa y turnos, ingresa tu número de Licencia de Conducir.
        </p>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '0.8rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: 600 }}>Número de Licencia</label>
            <input
              type="text" placeholder="Ej. LIC-12345678" value={licencia} onChange={e => setLicencia(e.target.value)}
              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', fontWeight: 600 }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button" onClick={onClose} disabled={isSubmitting}
              style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Más tarde
            </button>
            <button
              type="submit" disabled={isSubmitting}
              style={{ flex: 2, padding: '0.8rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 700, boxShadow: '0 4px 12px rgba(99,102,241,0.3)', opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Registrando...' : 'Registrarme ✓'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
  // ── NUEVO: fecha de nacimiento para métricas de rango etario ──
  birthDate?: string;
  roles: Role[];
  authExternals?: AuthExternal[];
  ciudadanoId?: string;
  conductorId?: string;
  // ID de persona en ms-business (necesario para PATCH /persona/:id)
  personaId?: string;
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
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [syncPersonaId, setSyncPersonaId] = useState<string | null>(null);

  const handleSetActiveRole = (role: Role) => {
    setActiveRole(role);
    permissionStore.setActiveRole(role);
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

    const userId = payload.user_id || payload._id || payload.id || explicitUser?.id || explicitUser?._id || user?.id;

    if (!userId || userId === "user-1") {
      console.warn("SyncSession: No se pudo resolver un ID de usuario válido desde el token o el estado previo.");
    }

    const email = explicitUser?.email || payload?.subject || payload?.sub || fallbackEmail || user?.email || "";
    const name = explicitUser?.name || payload?.name || user?.name || email.split("@")[0];
    const lastName = explicitUser?.lastName || payload?.lastName || user?.lastName || "";
    const photo = explicitUser?.photo || payload?.photo || user?.photo || null;

    const phone = explicitUser?.phone || user?.phone || "";
    const address = explicitUser?.address || user?.address || "";
    const authExternals = explicitUser?.authExternals || user?.authExternals || [];
    const ciudadanoId = explicitUser?.ciudadanoId || user?.ciudadanoId;
    const conductorId = explicitUser?.conductorId || user?.conductorId;
    // ── NUEVO: preservar birthDate y personaId ──
    const birthDate = explicitUser?.birthDate || user?.birthDate;
    const personaId = explicitUser?.personaId || user?.personaId;

    const tokenType = payload?.token_type;

    if (tokenType === "general") {
      const rawRoles: string[] = payload?.roles || [];

      const draftRoles: Role[] = rawRoles.map((r: string) => ({
        id: `role-${r.toLowerCase()}`,
        name: r,
        description: `Perfil detectado`,
        activo: true,
        permisos: []
      }));

      setUser({ id: userId || "user-1", name, lastName, email, phone, address, photo, roles: draftRoles, authExternals, ciudadanoId, conductorId, birthDate, personaId });
      setActiveRole(null);

      if (rawRoles.length === 1) {
        try {
          const result = await selectRole(rawRoles[0]);
          if (result && result.token && result.role) {
            return await syncSession(result.token, email, result.role, { id: userId, name, lastName, email, phone, address, photo, authExternals, ciudadanoId, conductorId, birthDate, personaId });
          }
        } catch (error) {
          handleSetActiveRole(draftRoles[0]);
        }
      }

    } else if (tokenType === "auth_role" || explicitRole) {
      const backendRole = explicitRole;

      const rawPermisos = backendRole?.permisos || [];

      const roleObj: Role = backendRole ? {
        id: backendRole.id || backendRole._id || `role-${backendRole.nombre?.toLowerCase() || 'default'}`,
        name: backendRole.nombre || backendRole.name || "ROLE",
        description: backendRole.descripcion || backendRole.description || "Perfil activo",
        activo: backendRole.activo ?? true,
        // Sincronizar aquí, una sola vez, para que useAuthorization reciba un rol completo
        permisos: synchronizeRolePermissions(rawPermisos)
      } : {
        id: "role-default",
        name: "USUARIO",
        description: "Acceso Básico",
        activo: true,
        permisos: synchronizeRolePermissions([])
      };

      setUser({ id: userId || "user-1", name, lastName, email, phone, address, photo, roles: [roleObj], authExternals, ciudadanoId, conductorId, birthDate, personaId });
      handleSetActiveRole(roleObj);

      syncBusinessUser().then((data) => {
        if (data) {
          if (data.ciudadanoId || data.conductorId || data.personaId) {
            setUser(prev => prev ? {
              ...prev,
              ciudadanoId: data.ciudadanoId,
              conductorId: data.conductorId,
              // ── NUEVO: guardar personaId, birthDate y nombre real desde ms-business ──
              personaId: data.personaId || prev.personaId,
              birthDate: data.birthDate || prev.birthDate,
              // Si ms-business devuelve el nombre real, actualizar
              name: data.firstName || prev.name,
              lastName: data.lastName || prev.lastName,
            } : null);
          }
          const isDriver = data.roles?.includes("Conductor") || data.roles?.includes("CONDUCTOR") || roleObj.name.toUpperCase() === "CONDUCTOR";
          if (isDriver && !data.conductorId) {
            setSyncPersonaId(data.id || userId);
            setShowLicenseModal(true);
          }
        }
      }).catch(() => {});
    } else {
      const rawRoles = payload?.roles || ["USER"];
      const fallbackRole: Role = {
        id: `role-${rawRoles[0].toLowerCase()}`,
        name: rawRoles[0].toUpperCase(),
        description: `Acceso`,
        activo: true,
        permisos: []
      };

      setUser({ id: userId || "user-1", name, lastName, email, phone, address, photo, roles: [fallbackRole], authExternals, birthDate, personaId });
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
            const { getMe } = await import("../services/auth.service");
            const sessionData = await getMe();
            await syncSession(token, undefined, sessionData.role, sessionData.user);
          } catch(err) {
            console.error("Error validando sesión:", err);
            setUser(null);
            setActiveRole(null);
          }
        } else {
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
    permissionStore.setActiveRole(null);
    localStorage.removeItem("activeRole");
    logoutService();
  };

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
      {showLicenseModal && syncPersonaId && (
        <DriverLicenseModal
          personaId={syncPersonaId}
          onSuccess={(conductorId) => {
            setUser(prev => prev ? { ...prev, conductorId } : null);
            setShowLicenseModal(false);
          }}
          onClose={() => setShowLicenseModal(false)}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  return context;
};