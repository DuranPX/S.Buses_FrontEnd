import { Navigate } from "react-router-dom";
import { useAuthContext } from "../features/auth/context/AuthContext";
import { useAuthorization } from "../features/roles/hooks/useAuthorization";
import { Loader } from "../shared/components/ui/Loader";
import { AccessDenied } from "../shared/components/feedback/AccessDenied";
import type { ModuleName, ActionType } from "../shared/config/modules";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: {
    module: ModuleName;
    action: ActionType;
  };
}

export const ProtectedRoute = ({ children, permission }: ProtectedRouteProps) => {
  const { isAuthenticated, activeRole, isLoading } = useAuthContext();
  const { can } = useAuthorization();

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (!activeRole) return null;

  if (permission && !can(permission.module, permission.action)) {
    return <AccessDenied module={permission.module} />;
  }

  // Protección adicional estricta: Si la ruta es de administración (y no es la respuesta pública de ePayco), solo entra el Admin
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const isIncidentesRoute = window.location.pathname.startsWith('/admin/incidentes');

  if (
    isAdminRoute &&
    !isIncidentesRoute &&
    (!permission || permission.module !== 'cartera')
  ) {
    if (activeRole.name !== 'Admin' && activeRole.name !== 'ADMIN') {
      return <AccessDenied module={permission?.module || ('admin' as any)} />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
