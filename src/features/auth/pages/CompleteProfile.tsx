import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { InputField } from "../../../shared/components/forms/InputField"
import { Button } from "../../../shared/components/ui/Button"
import { showAlert } from "../../../shared/utils/alerts"

export const CompleteProfile = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const provider = searchParams.get("provider") || "OAuth"
  const nameParam = searchParams.get("name") || ""
  const requireEmail = searchParams.get("requireEmail") === "true"

  const [email, setEmail] = useState("")

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (requireEmail && !emailRegex.test(email)) {
      showAlert.warning("Email inválido", "Por favor ingresa un correo electrónico válido.")
      return
    }

    // Redirigir al login/registro con los datos pre-llenados
    showAlert.info("Completa tu registro", "Te redirigiremos al formulario de registro para completar tu cuenta.")
    setTimeout(() => {
      navigate("/login", { state: { prefillName: nameParam, prefillEmail: email, fromProvider: provider } })
    }, 1500)
  }

  return (
    <div className="auth-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-container" style={{ width: '500px', minHeight: 'auto', padding: '2rem' }}>
        <form onSubmit={handleSubmit} className="glass" style={{ padding: '2.5rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐙</div>
          <h1 style={{ marginBottom: '0.5rem' }}>Completar Perfil</h1>
          
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Tu cuenta de <strong style={{ color: 'white' }}>{provider}</strong> no tiene un email público.
            {nameParam && (
              <><br />Hola <strong style={{ color: 'white' }}>{nameParam}</strong>, necesitamos tu email para completar el registro.</>
            )}
          </p>

          {requireEmail && (
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.correo@ejemplo.com"
              required
              style={{ width: '100%' }}
            />
          )}

          <Button
            type="submit"
            label="Continuar con el Registro"
            style={{ width: '100%', marginTop: '1.5rem' }}
          />

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

export default CompleteProfile
