import type { ReactNode } from "react";
import { useAuthorization } from "../hooks/useAuthorization";

interface CanAccessProps {
  role?: string;
  permission?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const CanAccess = ({ role, permission, children, fallback = null }: CanAccessProps) => {
  const { hasRole, hasPermission } = useAuthorization();

  let canAccess = true;

  if (role && !hasRole(role)) {
    canAccess = false;
  }

  if (permission && !hasPermission(permission)) {
    canAccess = false;
  }

  if (!canAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default CanAccess;
