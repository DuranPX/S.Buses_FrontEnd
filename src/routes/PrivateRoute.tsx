import { Navigate } from "react-router-dom"
import { useAuth } from "../features/auth/hooks/useAuth"
import type { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const PrivateRoute = ({ children }: Props) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}