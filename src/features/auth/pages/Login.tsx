import { useState, useMemo } from "react"
import { useNavigate, Link } from "react-router-dom"
import { login, register } from "../services/auth.service"
import { InputField } from "../../../shared/components/forms/InputField"
import { Button } from "../../../shared/components/ui/Button"
import { OAuthButtons } from "../components/OAuthButtons"
import { showAlert } from "../../../shared/utils/alerts"
import { useAuthFlow } from "../context/AuthFlowContext"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { useAuth } from "../hooks/useAuth"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const phoneRegex = /^[+]?[0-9]{7,15}$/

/** Calcula la fortaleza de la contraseña: 0='', 1='Débil', 2='Media', 3='Fuerte' */
const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
  if (!password) return { level: 0, label: '', color: 'transparent' };
  
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;
  
  if (score <= 1) return { level: 1, label: 'Débil', color: '#ef4444' };
  if (score <= 2) return { level: 2, label: 'Media', color: '#f59e0b' };
  if (score <= 3) return { level: 2, label: 'Media', color: '#f59e0b' };
  return { level: 3, label: 'Fuerte', color: '#22c55e' };
}

export const Login = () => {
  const navigate = useNavigate()
  const { setAuthFlow } = useAuthFlow()
  const { syncSession } = useAuth()
  const { executeRecaptcha } = useGoogleReCaptcha()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({ name: "", lastName: "", email: "", password: "", confirmPassword: "", phone: "" })

  const passwordStrength = useMemo(() => getPasswordStrength(registerData.password), [registerData.password]);

  const validate = (data: { email: string; password: string }) => {
    if (!emailRegex.test(data.email)) {
      showAlert.warning("Email inválido", "Por favor ingresa un correo electrónico válido.")
      return false
    }
    if (!passwordRegex.test(data.password)) {
      showAlert.warning("Contraseña débil", "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.")
      return false
    }
    return true
  }

  const validateRegistration = () => {
    if (!validate(registerData)) return false;
    
    if (registerData.name.length < 2 || registerData.name.length > 50) {
      showAlert.warning("Nombre inválido", "El nombre debe tener entre 2 y 50 caracteres.")
      return false
    }
    if (registerData.lastName.length < 2 || registerData.lastName.length > 50) {
      showAlert.warning("Apellido inválido", "El apellido debe tener entre 2 y 50 caracteres.")
      return false
    }
    if (!phoneRegex.test(registerData.phone)) {
      showAlert.warning("Teléfono inválido", "El teléfono debe tener entre 7 y 15 dígitos numéricos.")
      return false
    }
    if (registerData.password !== registerData.confirmPassword) {
      showAlert.error("Error", "Las contraseñas no coinciden.")
      return false
    }
    return true;
  }

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate(loginData)) return
    
    if (!executeRecaptcha) {
      showAlert.error("Error", "reCAPTCHA no está disponible en este momento.")
      return
    }

    const recaptchaToken = await executeRecaptcha("login")
    
    try {
      const result = await login({ ...loginData, recaptchaToken })
      
      const savedToken = localStorage.getItem("token")
      
      // Si el backend no devuelve token y tampoco está un token salvado temporalmente, significa que se envió el correo 2FA
      if ((result && !result.token) && !savedToken) {
        setAuthFlow({ 
          requires2FA: true, 
          email: loginData.email, 
          expiresAt: Date.now() + 60000, 
          attemptsLeft: 3 
        })
        showAlert.info("Verificación requerida", result.message || "Se ha enviado un código a tu correo.")
        navigate("/verify-code")
        return
      }
      
      if (savedToken || (result && result.token)) {
        // Usa el contexto de auth para decodificar el JWT y actualizar el estado global.
        syncSession(result?.token || savedToken, loginData.email);
        showAlert.success("¡Bienvenido de nuevo!", "Has iniciado sesión correctamente.")
        setTimeout(() => navigate("/dashboard"), 1500)
      }
    } catch (error) {
      // El error ya es manejado por el servicio de auth
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateRegistration()) return
    
    if (!executeRecaptcha) {
      showAlert.error("Error", "reCAPTCHA no está disponible.")
      return
    }

    const recaptchaToken = await executeRecaptcha("register")
    
    try {
      await register({ ...registerData, recaptchaToken })
      
      // En vez de requerirle login otra vez como antes, iniciamos el flujo de verificación
      setAuthFlow({ 
        requires2FA: true, 
        email: registerData.email, 
        expiresAt: Date.now() + 60000, 
        attemptsLeft: 3,
        purpose: "REGISTRO" // Indicamos que es de Registro para que el re-envio y el verify sepan que NO recibirán Token
      })

      showAlert.info("Verificación de Correo", "Cuenta creada. Hemos enviado un código de activación a tu correo electrónico.")
      navigate("/verify-code")
    } catch (error) {
      // El error ya es manejado por el servicio de auth
    }
  }

  return (
    <div className="auth-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className={`auth-container ${isSignUp ? "right-panel-active" : ""}`}>
        
        {/* Sign Up Form */}
        <div className="auth-form-container sign-up-container">
          <form onSubmit={handleRegisterSubmit} className="glass" style={{ padding: '2rem 3rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>
            <h1>Crear Cuenta</h1>
            <OAuthButtons />
            <span style={{ margin: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>o usa tu email para registrarte</span>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <InputField
                label="Nombre"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                required
              />
              <InputField
                label="Apellido"
                value={registerData.lastName}
                onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                required
              />
            </div>
            <InputField
              label="Email"
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              required
            />
            <InputField
              label="Teléfono"
              type="tel"
              value={registerData.phone}
              onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
              required
            />
            <InputField
              label="Contraseña"
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              required
            />
            {/* Indicador de fortaleza de contraseña */}
            {registerData.password && (
              <div style={{ width: '100%', marginTop: '0.25rem' }}>
                <div style={{
                  width: '100%',
                  height: '4px',
                  borderRadius: '2px',
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(passwordStrength.level / 3) * 100}%`,
                    height: '100%',
                    background: passwordStrength.color,
                    borderRadius: '2px',
                    transition: 'all 0.3s ease'
                  }} />
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  color: passwordStrength.color,
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  marginTop: '0.2rem',
                  display: 'block'
                }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
            <InputField
              label="Confirmar Contraseña"
              type="password"
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
              required
            />
            {/* Indicador visual de coincidencia */}
            {registerData.confirmPassword && (
              <span style={{
                fontSize: '0.7rem',
                color: registerData.password === registerData.confirmPassword ? '#22c55e' : '#ef4444',
                fontWeight: 600,
                marginTop: '0.15rem',
                display: 'block'
              }}>
                {registerData.password === registerData.confirmPassword ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
              </span>
            )}
            <Button type="submit" label="Registrarse" style={{ width: '100%', marginTop: '1rem' }} className="btn-primary btn-lg" />
          </form>
        </div>

        {/* Sign In Form */}
        <div className="auth-form-container sign-in-container">
          <form onSubmit={handleLoginSubmit} className="glass" style={{ padding: '3rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1>Iniciar Sesión</h1>
            <OAuthButtons />
            <span style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>o usa tu cuenta existente</span>
            <InputField
              label="Email"
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
            />
            <InputField
              label="Contraseña"
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
            />
            <Link to="/forgot-password" style={{ margin: '1rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>¿Olvidaste tu contraseña?</Link>
            <Button type="submit" label="Entrar" style={{ width: '100%' }} />
          </form>
        </div>

        {/* Overlay */}
        <div className="auth-overlay-container">
          <div className="auth-overlay">
            <div className="auth-overlay-panel auth-overlay-left">
              <h1>¡Hola de nuevo!</h1>
              <p>Si ya tienes una cuenta, inicia sesión para continuar con nosotros.</p>
              <Button label="Ir al Login" onClick={() => setIsSignUp(false)} className="btn-ghost" />
            </div>
            <div className="auth-overlay-panel auth-overlay-right">
              <h1>¡Bienvenido!</h1>
              <p>Ingresa tus datos personales y comienza tu viaje con nosotros.</p>
              <Button label="Registrarse" onClick={() => setIsSignUp(true)} className="btn-ghost" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
