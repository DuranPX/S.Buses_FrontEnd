import { useState } from "react"
import { login } from "../services/authService"
import { InputField } from "../components/InputField"
import { Button } from "../components/Button"
import { FormCard } from "../components/FormCard"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  })

  const validate = () => {
    const newErrors = { email: "", password: "" }
    let isValid = true

    if (!email) {
      newErrors.email = "El email es obligatorio"
      isValid = false
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Ingresa un email válido (ej: usuario@correo.com)"
      isValid = false
    }

    if (!password) {
      newErrors.password = "La contraseña es obligatoria"
      isValid = false
    } else if (!passwordRegex.test(password)) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especia"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validate()) return

    try {
      await login({ email, password })
      window.location.href = "/dashboard"
      console.log("Login exitoso")
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        password: "Credenciales incorrectas"
      }))
      console.log("Credenciales incorrectas")
    }
  }

  return (
    <FormCard title="Login">
      <form onSubmit={handleSubmit}>
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors(prev => ({ ...prev, email: "" }))
          }}
        />
        {errors.email && <p style={{ color: "red", fontSize: "12px" }}>{errors.email}</p>}

        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setErrors(prev => ({ ...prev, password: "" }))
          }}
        />
        {errors.password && <p style={{ color: "red", fontSize: "12px" }}>{errors.password}</p>}

        <Button type="submit" label="Login" />
      </form>
    </FormCard>
  )
}