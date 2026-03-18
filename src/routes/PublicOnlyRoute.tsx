import { Navigate } from "react-router-dom"
import { useAuth } from "../features/auth/hooks/useAuth"
import type { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const PublicOnlyRoute = ({ children }: Props) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  }

  return <>{children}</>
}

export default PublicOnlyRoute
