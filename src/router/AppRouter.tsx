import { BrowserRouter, Routes, Route } from "react-router-dom"

import { Login } from "../pages/Login"
import { Register } from "../pages/Register"
import { Dashboard } from "../pages/Dashboard"
import { AdminRoles } from "../pages/AdminRoles"
import { AuthGuard } from "./AuthGuard"
import { Forbidden } from "../pages/Forbidden"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/403" element={<Forbidden />} />

        {/*Rutas protegidas */}
        <Route element = {<AuthGuard/>}>
          <Route path="/admin/roles" element={<AdminRoles />} />
          <Route path="/dashboard" element = {<Dashboard/>} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  )
}