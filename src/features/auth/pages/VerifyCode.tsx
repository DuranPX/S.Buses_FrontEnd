import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthFlow } from "../context/AuthFlowContext"
import { useAuth } from "../hooks/useAuth"
import { Button } from "../../../shared/components/ui/Button"
import { showAlert } from "../../../shared/utils/alerts"
import { verify2faCode, send2faCode } from "../services/auth.service"
import { maskEmail } from "../../../shared/utils/maskEmail"
import type { AxiosError } from "axios"

export const VerifyCode = () => {
  const navigate = useNavigate()
  const { authFlow, setAuthFlow, clearAuthFlow } = useAuthFlow()
  const { syncSession } = useAuth()
  const [code, setCode] = useState("")
  const [timeLeft, setTimeLeft] = useState(0)
  const [isExpired, setIsExpired] = useState(false)

  const maskedEmail = useMemo(() => maskEmail(authFlow.email), [authFlow.email]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const remaining = Math.max(0, Math.floor((authFlow.expiresAt - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining === 0) setIsExpired(true)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [authFlow.expiresAt])

  // Invalidar sesión parcial al cerrar ventana durante 2FA
  useEffect(() => {
    const handleBeforeUnload = () => {
      clearAuthFlow();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [clearAuthFlow])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isExpired) {
      showAlert.error("Código expirado", "El código ha expirado. Por favor solicita uno nuevo.")
      return
    }

    if (authFlow.attemptsLeft <= 0) {
      showAlert.error("Intentos agotados", "Has superado el límite de intentos. Por favor solicita un nuevo código.")
      return
    }

    try {
      const result = await verify2faCode(authFlow.email, code)
      
      const savedToken = localStorage.getItem("token")
      
      if (savedToken || (result && result.token)) {
        syncSession(result?.token || savedToken, authFlow.email);
        showAlert.success("¡Verificación exitosa!", "Has iniciado sesión correctamente.")
        clearAuthFlow()
        setTimeout(() => navigate("/dashboard"), 1000)
      } else if (authFlow.purpose === "REGISTRO") {
        showAlert.success("¡Cuenta Activada!", "Verificación exitosa. Ya puedes iniciar sesión.")
        clearAuthFlow()
        setTimeout(() => navigate("/login"), 1000)
      } else {
        throw new Error("Token no recibido del servidor.")
      }
    } catch (error) {
      // Extraer intentosRestantes del error del backend
      const err = error as AxiosError<{ error?: string, intentosRestantes?: number }>;
      const intentosBackend = err?.response?.data?.intentosRestantes;
      
      if (intentosBackend !== undefined) {
        // Usar los intentos del backend como fuente de verdad
        setAuthFlow({ ...authFlow, attemptsLeft: intentosBackend });
        if (intentosBackend <= 0) {
          showAlert.error("Intentos agotados", "Sin intentos restantes. Debes reenviar el código.")
        }
      } else {
        // Fallback: decrementar localmente
        const newAttempts = authFlow.attemptsLeft - 1;
        setAuthFlow({ ...authFlow, attemptsLeft: newAttempts });
        if (newAttempts <= 0) {
          showAlert.error("Intentos agotados", "Sin intentos restantes. Debes reenviar el código.")
        }
      }
    }
  }

  const handleResend = async () => {
    try {
      await send2faCode(authFlow.email, authFlow.purpose as "LOGIN" | "REGISTRO");
      setAuthFlow({
        ...authFlow,
        expiresAt: Date.now() + 60000,
        attemptsLeft: 3
      })
      setIsExpired(false)
      setCode("")
      showAlert.success("Código reenviado", "Se ha enviado un nuevo código a tu correo.")
    } catch(err) {
    }
  }

  return (
    <div className="auth-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-container" style={{ width: '500px', minHeight: 'auto', padding: '2rem' }}>
        <form onSubmit={handleVerify} className="glass" style={{ padding: '3rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h1>Verificar Código</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Ingresa el código de 6 dígitos enviado a <strong>{maskedEmail}</strong>
          </p>

          <div style={{ width: '100%', marginBottom: '1.5rem' }}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              style={{
                width: '100%',
                letterSpacing: '0.8rem',
                fontSize: '2rem',
                textAlign: 'center',
                padding: '1rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                outline: 'none'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem', color: isExpired ? 'var(--error)' : 'var(--text-muted)' }}>
            {isExpired ? "El código ha expirado" : `El código expira en: ${timeLeft}s`}
          </div>

          <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: authFlow.attemptsLeft <= 1 ? '#ef4444' : 'var(--text-muted)' }}>
            Intentos restantes: {authFlow.attemptsLeft}
          </div>

          <Button 
            type="submit" 
            label="Verificar" 
            disabled={isExpired || authFlow.attemptsLeft <= 0} 
            style={{ width: '100%', marginBottom: '1rem' }} 
          />

          <button
            type="button"
            onClick={handleResend}
            style={{
              background: 'none',
              border: 'none',
              color: isExpired || authFlow.attemptsLeft <= 0 ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.9rem'
            }}
          >
            ¿No recibió el código? Revisar spam o reenviar
          </button>

          <button
            type="button"
            onClick={() => { clearAuthFlow(); navigate("/login"); }}
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

export default VerifyCode
