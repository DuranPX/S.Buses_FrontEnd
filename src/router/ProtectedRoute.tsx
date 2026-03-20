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
  
  // Gate: Asegurar que activeRole esté definido antes de renderizar cualquier contenido protegido
  if (!activeRole) return null;

  if (permission && !can(permission.module, permission.action)) {
    return <AccessDenied module={permission.module} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
