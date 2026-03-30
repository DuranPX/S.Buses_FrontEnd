import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "../features/auth/pages/Login"
import Dashboard from "../features/dashboard/pages/Dashboard"
import AdminRoles from "../features/roles/pages/AdminRoles"
import Landing from "../features/landing/pages/Landing"
import MainLayout from "../shared/layouts/MainLayout"
import { ProtectedRoute } from "./ProtectedRoute"
import { PrivateRoute } from "../routes/PrivateRoute"
import { PublicOnlyRoute } from "../routes/PublicOnlyRoute"
import { MODULES } from "../shared/config/modules"
import { GenericModulePlaceholder } from "../shared/components/layouts/GenericModulePlaceholder"

// New Pages
import AdminUsers from "../features/users/pages/AdminUsers"
import VerifyCode from "../features/auth/pages/VerifyCode"
import ForgotPassword from "../features/auth/pages/ForgotPassword"
import ResetPassword from "../features/auth/pages/ResetPassword"
import { AuthFlowGuard } from "../features/auth/components/AuthFlowGuard"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        <Route path="/login" element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        } />

        <Route path="/forgot-password" element={
          <PublicOnlyRoute>
            <ForgotPassword />
          </PublicOnlyRoute>
        } />

        <Route path="/reset-password" element={
          <PublicOnlyRoute>
            <AuthFlowGuard>
              <ResetPassword />
            </AuthFlowGuard>
          </PublicOnlyRoute>
        } />

        <Route path="/verify-code" element={
          <PublicOnlyRoute>
            <AuthFlowGuard>
              <VerifyCode />
            </AuthFlowGuard>
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
          <Route path="/dashboard" element={
            <ProtectedRoute permission={{ module: MODULES.DASHBOARD, action: 'leer' }}>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/roles" element={
            <ProtectedRoute permission={{ module: MODULES.ROLES, action: 'leer' }}>
              <AdminRoles />
            </ProtectedRoute>
          } />

          <Route path="/admin/usuarios" element={
            <ProtectedRoute permission={{ module: MODULES.USUARIOS, action: 'leer' }}>
              <AdminUsers />
            </ProtectedRoute>
          } />

          {/* Scaffolding Dinámico de Módulos (En construcción) */}
          {[
            MODULES.EMPRESAS, MODULES.BUSES, MODULES.CONDUCTORES,
            MODULES.RUTAS, MODULES.PARADEROS, MODULES.PROGRAMACIONES, MODULES.TURNOS,
            MODULES.CLIENTES, MODULES.PAGOS, MODULES.BOLETOS, MODULES.VALIDACIONES,
            MODULES.INCIDENTES, MODULES.MENSAJES, MODULES.GRUPOS, MODULES.RESENAS,
            MODULES.RECARGAS
          ].map(modulo => (
             <Route key={modulo} path={`/admin/${modulo}`} element={
               <ProtectedRoute permission={{ module: modulo, action: 'leer' }}>
                 <GenericModulePlaceholder moduleName={modulo} />
               </ProtectedRoute>
             } />
          ))}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}