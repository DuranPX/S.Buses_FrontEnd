import { BrowserRouter, Routes, Route } from "react-router-dom"

import { Login } from "../pages/Login"
import { Register } from "../pages/Register"
import { Dashboard } from "../pages/Dashboard"
import { AdminRoles } from "../pages/AdminRoles"
import { PrivateRoute } from "../routes/PrivateRoute"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/roles" element={<AdminRoles />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}