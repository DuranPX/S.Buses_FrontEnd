import { useState } from "react"
import { InputField } from "../components/InputField"
import { Button } from "../components/Button"
import { FormCard } from "../components/FormCard"

export const Register = () => {

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    console.log("Register data:", {
      name,
      email,
      password
    })
  }

  return (
    <FormCard title="Crear Cuenta">

      <form onSubmit={handleSubmit}>

        <InputField
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" label="Registrarse" />

      </form>

    </FormCard>
  )
}

export default Register