import { useState } from "react"
import { login, register } from "../services/auth.service"
import { InputField } from "../../../shared/components/forms/InputField"
import { Button } from "../../../shared/components/ui/Button"
import { OAuthButtons } from "../components/OAuthButtons"
import { showAlert } from "../../../shared/utils/alerts"

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" })

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await login(loginData)
      showAlert.success("¡Bienvenido de nuevo!", "Has iniciado sesión correctamente.")
      setTimeout(() => window.location.href = "/dashboard", 1500)
    } catch (error) {
      showAlert.error("Error de acceso", "Las credenciales no son válidas.")
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await register(registerData)
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
            <a href="#" style={{ margin: '1rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>¿Olvidaste tu contraseña?</a>
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
