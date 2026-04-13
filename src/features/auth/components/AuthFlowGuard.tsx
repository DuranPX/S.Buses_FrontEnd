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

  // Guardian para Reset Password
  if (location.pathname === "/reset-password") {
    // Permitir el acceso si traemos el state nativo (AuthFlow) o si venimos por click en link de correo
    const hasContext = !!authFlow.email;
    const hasUrlParams = searchParams.get("token") || searchParams.get("codigo") || searchParams.get("email");
    
    if (!hasContext && !hasUrlParams) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default AuthFlowGuard;
