import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { InputField } from "../../../shared/components/forms/InputField"
import { Button } from "../../../shared/components/ui/Button"
import { showAlert } from "../../../shared/utils/alerts"
import { useAuthFlow } from "../context/AuthFlowContext"
import { verifyRecoveryCode } from "../services/auth.service"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import type { AxiosError } from "axios"

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { authFlow, clearAuthFlow } = useAuthFlow()
  const { executeRecaptcha } = useGoogleReCaptcha()
  
  const emailVal = searchParams.get("email") || authFlow.email || ""
  const codigoUrl = searchParams.get("codigo") || searchParams.get("token") || ""
  
  const [codigo, setCodigo] = useState(codigoUrl)
  const [attemptsLeft, setAttemptsLeft] = useState(authFlow.attemptsLeft || 3)
  
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

    if (!emailVal || !codigo || codigo.length < 6) {
      showAlert.error("Datos incompletos", "Por favor ingresa el código de 6 dígitos completo que enviamos a tu correo.")
      return
    }

    if (!executeRecaptcha) {
      showAlert.error("Error", "reCAPTCHA no está disponible.")
      return
    }

    const recaptchaToken = await executeRecaptcha("recovery")

    try {
      await verifyRecoveryCode({
        email: emailVal,
        codigo,
        newPassword: passwordData.password,
        recaptchaToken
      })

      showAlert.success("Contraseña actualizada", "Tu contraseña ha sido cambiada correctamente.")
      clearAuthFlow()
      setTimeout(() => navigate("/login"), 1500)
    } catch (err) {
      // Extraer intentosRestantes del error del backend
      const axiosErr = err as AxiosError<{ error?: string, intentosRestantes?: number }>;
      const intentosBackend = axiosErr?.response?.data?.intentosRestantes;
      
      if (intentosBackend !== undefined) {
        setAttemptsLeft(intentosBackend);
        if (intentosBackend <= 0) {
          showAlert.error("Intentos agotados", "Has superado el límite de intentos. Solicita un nuevo código de recuperación.")
        }
      }
    }
  }

  return (
    <div className="auth-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-container" style={{ width: '500px', minHeight: 'auto', padding: '2rem' }}>
        <form onSubmit={handleSubmit} className="glass" style={{ padding: '3rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1>Nueva Contraseña</h1>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
            Ingresa el código que enviamos a <strong>{emailVal || 'tu correo'}</strong> y tu nueva contraseña.
          </p>

          <div style={{ width: '100%', marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'left' }}>Código de Verificación</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              style={{
                width: '100%',
                letterSpacing: '0.8rem',
                fontSize: '1.8rem',
                textAlign: 'center',
                padding: '0.8rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                outline: 'none'
              }}
              required
            />
          </div>

          {attemptsLeft < 3 && (
            <div style={{ 
              marginBottom: '1rem', 
              fontSize: '0.85rem', 
              color: attemptsLeft <= 1 ? '#ef4444' : '#f59e0b',
              fontWeight: 600
            }}>
              Intentos restantes: {attemptsLeft}
            </div>
          )}

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

          <Button type="submit" label="Actualizar Contraseña" style={{ width: '100%', marginTop: '1.5rem', opacity: (!emailVal || codigo.length < 6 || attemptsLeft <= 0) ? 0.5 : 1 }} disabled={!emailVal || codigo.length < 6 || attemptsLeft <= 0} />

          {!emailVal && (
            <div style={{ color: 'var(--error)', marginTop: '1.5rem', fontSize: '0.85rem', textAlign: 'center' }}>
              Error: No identificamos el email.
              <br />
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                style={{
                  marginTop: '0.5rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  textDecoration: 'underline'
                }}
              >
                Solicitar código de nuevo
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
