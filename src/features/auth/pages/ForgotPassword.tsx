import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { InputField } from "../../../shared/components/forms/InputField"
import { Button } from "../../../shared/components/ui/Button"
import { showAlert } from "../../../shared/utils/alerts"

export const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simular reCAPTCHA v3
    const recaptchaToken = "mock-recaptcha-token-forgot-" + Math.random().toString(36).substring(7);
    console.log("reCAPTCHA simulated for Forgot Password:", recaptchaToken);
    
    // Simulación
    showAlert.success("Email enviado", `Se ha enviado un enlace de recuperación a ${email}.`)
    setTimeout(() => {
        // Redirigir al Login para que el usuario pueda simular "clic en el correo" 
        // o navegar manualmente a /reset-password?token=mock123
        showAlert.info("Nota de simulación", "Usa la URL /reset-password?token=abc123 para probar la siguiente etapa.");
        navigate("/login");
    }, 2000);
  }

  return (
    <div className="auth-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-container" style={{ width: '500px', minHeight: 'auto', padding: '2rem' }}>
        <form onSubmit={handleSubmit} className="glass" style={{ padding: '3rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1>Recuperar Contraseña</h1>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
            Ingresa tu email y te enviaremos un código de recuperación.
          </p>

          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%' }}
          />

          <Button type="submit" label="Enviar" style={{ width: '100%', marginTop: '1.5rem' }} />

          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              marginTop: '2rem',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Volver al Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword
