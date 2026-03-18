import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "../features/auth/pages/Login"
import Dashboard from "../features/dashboard/pages/Dashboard"
import AdminRoles from "../features/roles/pages/AdminRoles"
import Landing from "../features/landing/pages/Landing"
import MainLayout from "../shared/layouts/MainLayout"
import { PrivateRoute } from "../routes/PrivateRoute"
import { PublicOnlyRoute } from "../routes/PublicOnlyRoute"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública Inicial */}
        <Route path="/" element={<Landing />} />
        
        {/* Rutas de Autenticación */}
        <Route path="/login" element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        } />

        {/* Rutas Protegidas con Layout de Administración */}
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/roles" element={<AdminRoles />} />
          {/* Aquí añadirás más rutas internas en el futuro */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}