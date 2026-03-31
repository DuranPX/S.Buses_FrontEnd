import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { InputField } from "../../../shared/components/forms/InputField"
import { Button } from "../../../shared/components/ui/Button"
import { showAlert } from "../../../shared/utils/alerts"
import { sendRecoveryCode } from "../services/auth.service"
import { useAuthFlow } from "../context/AuthFlowContext"

export const ForgotPassword = () => {
  const navigate = useNavigate()
  const { setAuthFlow } = useAuthFlow()
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await sendRecoveryCode(email)
      setAuthFlow({
        email,
        purpose: "RECOVERY",
        expiresAt: Date.now() + 300000, // 5 minutes approx
        attemptsLeft: 3
      })
      showAlert.success("Código enviado", `Revisa tu bandeja de entrada en ${email}.`)
      setTimeout(() => {
          navigate("/reset-password");
      }, 1500);
    } catch(err) {
      // El mensaje de error ya es manejado por el servicio de auth
    }
  }

  return (
    <div className="auth-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-container" style={{ width: '500px', minHeight: 'auto', padding: '2rem' }}>
        <form onSubmit={handleSubmit} className="glass" style={{ padding: '2rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1>Recuperar Contraseña</h1>
          <p style={{ color: 'var(--text-muted)', textAlign: 'justify', marginBottom: '1rem' }}>
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

          <Button type="submit" label="Enviar Código" style={{ width: '100%', marginTop: '1.5rem' }} />

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
