import { useState } from "react"
import { InputField } from "../components/InputField"
import { Button } from "../components/Button"
import { FormCard } from "../components/FormCard"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]{3,}$/

export const Register = () => {

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const validate = () => {
    const newError = { name: "", email: "", password: "", confirmPassword: "" }
    let isValid = true

    if (!name) {
      newError.name = "El nombre es obligatorio"
      isValid = false
    } else if (!nameRegex.test(name)) {
      newError.name = "El nombre debe tener al menos 3 caracters, y no puede tener caracteres especiales"
      isValid = false
    }
    if (!email) {
      newError.email = "El email es obligatorio"
      isValid = false
    } else if (!emailRegex.test(email)) {
      newError.email = "Ingresa un email válido (ej: usuario@correo.com"
      isValid = false
    }
    if (!password) {
      newError.password = "La contraseña es obligatoria"
      isValid = false
    } else if (!passwordRegex.test(password)) {
      newError.password = "Mínimo 8 caracteres, una mayúscula, un número y un carácter especial (@$!%*?&)"
      isValid = false
    }
    if (!confirmPassword) {
      newError.confirmPassword = "Confirma tu contraseña"
      isValid = false
    } else if (password !== confirmPassword) {
      newError.confirmPassword = "La contraseña no coincide"
      isValid = false
    }

    setErrors(newError)
    return isValid

  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      console.log("Register data:", { name, email, password })
      //Llamada al Backend
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        email: "Este email ya esta registrado"
      }))
    }
  }

  return (
      <FormCard title="Crear Cuenta">

        <form onSubmit={handleSubmit}>

          <InputField
              label="Nombre"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErrors(prev => ({ ...prev, name: "" }))
              }}
          />
          {errors.name && <p style={{ color: "red", fontSize: "12px" }}>{errors.name}</p>}

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
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setErrors(prev => ({ ...prev, password: "" }))
                }}
            />
            {errors.password && <p style={{ color: "red", fontSize: "12px" }}>{errors.password}</p>}

            <InputField
                label="Confirmar contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setErrors(prev => ({ ...prev, confirmPassword: "" }))
                }}
            />
            {errors.confirmPassword && <p style={{ color: "red", fontSize: "12px" }}>{errors.confirmPassword}</p>}

        <Button type="submit" label="Registrarse" />

      </form>

    </FormCard>
  )
}

export default Register