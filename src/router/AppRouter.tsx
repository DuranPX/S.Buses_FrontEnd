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


        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={
            <ProtectedRoute>
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


          {[
            MODULES.EMPRESAS, MODULES.BUSES, MODULES.CONDUCTORES,
            MODULES.PROGRAMACIONES, MODULES.TURNOS, MODULES.CLIENTES,
            MODULES.INCIDENTES
          ].map(modulo => (
             <Route key={`admin-${modulo}`} path={`/admin/${modulo}`} element={
               <ProtectedRoute permission={{ module: modulo, action: 'leer' }}>
                 <GenericModulePlaceholder moduleName={modulo} />
               </ProtectedRoute>
             } />
          ))}


          {[
            MODULES.RUTAS, MODULES.PARADEROS, MODULES.PAGOS, 
            MODULES.BOLETOS, MODULES.VALIDACIONES, MODULES.MENSAJES, 
            MODULES.GRUPOS, MODULES.RESENAS, MODULES.RECARGAS
          ].map(modulo => (
             <Route key={`public-${modulo}`} path={`/${modulo}`} element={
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