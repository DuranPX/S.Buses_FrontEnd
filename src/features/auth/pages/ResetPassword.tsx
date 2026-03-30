import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { InputField } from "../../../shared/components/forms/InputField"
import { Button } from "../../../shared/components/ui/Button"
import { showAlert } from "../../../shared/utils/alerts"
import { useAuthFlow } from "../context/AuthFlowContext"
import { verifyRecoveryCode } from "../services/auth.service"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { clearAuthFlow } = useAuthFlow()
  const { executeRecaptcha } = useGoogleReCaptcha()
  
  const email = searchParams.get("email")
  const codigo = searchParams.get("codigo") || searchParams.get("token") // Fallback por si usan token
  
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordRegex.test(passwordData.password)) {
      showAlert.warning("Contraseña débil", "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.")
      return
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      showAlert.error("Error", "Las contraseñas no coinciden.")
      return
    }

    if (!email || !codigo) {
      showAlert.error("Enlace inválido", "El enlace de recuperación está incompleto o es inválido.")
      return
    }

    if (!executeRecaptcha) {
      showAlert.error("Error", "reCAPTCHA no está disponible.")
      return
    }

    const recaptchaToken = await executeRecaptcha("recovery")

    try {
      await verifyRecoveryCode({
        email,
        codigo,
        newPassword: passwordData.password,
        recaptchaToken
      })

      showAlert.success("Contraseña actualizada", "Tu contraseña ha sido cambiada correctamente.")
      clearAuthFlow()
      setTimeout(() => navigate("/login"), 1500)
    } catch (err) {
      // El mensaje de error ya es manejado por el servicio de auth
    }
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

          {(!email || !codigo) && (
            <div style={{ color: 'var(--error)', marginTop: '1rem', fontSize: '0.8rem', textAlign: 'center' }}>
              Error: Faltan parámetros en la URL (email o código).
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
