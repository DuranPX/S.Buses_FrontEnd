import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { InputField } from "../../../shared/components/forms/InputField"
import { Button } from "../../../shared/components/ui/Button"
import { showAlert } from "../../../shared/utils/alerts"
import { useAuthFlow } from "../context/AuthFlowContext"

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { clearAuthFlow } = useAuthFlow()
  const token = searchParams.get("token")
  
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordRegex.test(passwordData.password)) {
      showAlert.warning("Contraseña débil", "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.")
      return
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      showAlert.error("Error", "Las contraseñas no coinciden.")
      return
    }

    // Validación simulada del token
    if (!token) {
      showAlert.error("Token inválido", "No se encontró un token de recuperación válido.")
      return
    }

    showAlert.success("Contraseña actualizada", "Tu contraseña ha sido cambiada correctamente.")
    clearAuthFlow()
    setTimeout(() => navigate("/login"), 1500)
  }

  return (
    <div className="auth-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-container" style={{ width: '500px', minHeight: 'auto', padding: '2rem' }}>
        <form onSubmit={handleSubmit} className="glass" style={{ padding: '3rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1>Nueva Contraseña</h1>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
            Ingresa tu nueva contraseña para acceder.
          </p>

          <InputField
            label="Nueva Contraseña"
            type="password"
            value={passwordData.password}
            onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
            required
            style={{ width: '100%' }}
          />

          <InputField
            label="Confirmar Contraseña"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            required
            style={{ width: '100%', marginTop: '1rem' }}
          />

          <Button type="submit" label="Actualizar" style={{ width: '100%', marginTop: '1.5rem' }} />

          {!token && (
            <div style={{ color: 'var(--error)', marginTop: '1rem', fontSize: '0.8rem' }}>
              Error: Falta el token de recuperación en la URL.
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
