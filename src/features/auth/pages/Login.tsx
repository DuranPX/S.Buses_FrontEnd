import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { login, register } from "../services/auth.service"
import { InputField } from "../../../shared/components/forms/InputField"
import { Button } from "../../../shared/components/ui/Button"
import { OAuthButtons } from "../components/OAuthButtons"
import { showAlert } from "../../../shared/utils/alerts"
import { useAuthFlow } from "../context/AuthFlowContext"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export const Login = () => {
  const navigate = useNavigate()
  const { setAuthFlow } = useAuthFlow()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" })

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

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate(loginData)) return
    
    // Simular reCAPTCHA v3
    const recaptchaToken = "mock-recaptcha-token-login-" + Math.random().toString(36).substring(7);
    console.log("reCAPTCHA simulated for Login:", recaptchaToken);
    
    // Verificar si se requiere 2FA para este usuario simulado
    if (loginData.email === "admin@buses.com") {
      setAuthFlow({ 
        requires2FA: true, 
        email: loginData.email, 
        expiresAt: Date.now() + 60000, 
        attemptsLeft: 3 
      });
      showAlert.info("Verificación requerida", "Se ha enviado un código a tu correo.");
      navigate("/verify-code");
      return;
    }

    try {
      await login({ ...loginData, recaptchaToken } as any);
      showAlert.success("¡Bienvenido de nuevo!", "Has iniciado sesión correctamente.");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      showAlert.error("Error de acceso", "Las credenciales no son válidas.");
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate(registerData)) return
    
    // Simular reCAPTCHA v3
    const recaptchaToken = "mock-recaptcha-token-register-" + Math.random().toString(36).substring(7);
    console.log("reCAPTCHA simulated for Register:", recaptchaToken);
    
    try {
      await register({ ...registerData, recaptchaToken } as any)
      showAlert.success("Cuenta creada", "Te has registrado con éxito. Ahora puedes acceder.")
      setIsSignUp(false)
    } catch (error) {
      showAlert.error("Error de registro", "No se pudo crear la cuenta. Inténtalo de nuevo.")
    }
  }

  return (
    <div className="auth-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className={`auth-container ${isSignUp ? "right-panel-active" : ""}`}>
        
        {/* Sign Up Form */}
        <div className="auth-form-container sign-up-container">
          <form onSubmit={handleRegisterSubmit} className="glass" style={{ padding: '3rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1>Crear Cuenta</h1>
            <OAuthButtons />
            <span style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>o usa tu email para registrarte</span>
            <InputField
              label="Nombre"
              value={registerData.name}
              onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              required
            />
            <InputField
              label="Email"
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              required
            />
            <InputField
              label="Contraseña"
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              required
            />
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
