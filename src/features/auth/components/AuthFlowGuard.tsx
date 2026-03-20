import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuthFlow } from "../context/AuthFlowContext";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const AuthFlowGuard = ({ children }: Props) => {
  const { authFlow } = useAuthFlow();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Guardian para 2FA
  if (location.pathname === "/verify-code" && !authFlow.requires2FA) {
    return <Navigate to="/login" replace />;
  }

  // Guardian para Reset Password (requiere token en la URL muchachos, es el /reset-password?token=abc123)
  if (location.pathname === "/reset-password" && !searchParams.get("token")) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthFlowGuard;
