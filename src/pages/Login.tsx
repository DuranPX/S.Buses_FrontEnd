import { useState } from "react"
import { login } from "../services/authService"
import { InputField } from "../components/InputField"
import { Button } from "../components/Button"
import { FormCard } from "../components/FormCard"

export const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await login({ email, password })

      alert("Login exitoso")

      window.location.href = "/dashboard"
    } catch (error) {
      alert("Credenciales incorrectas")
    }
  }

  return (
    <FormCard title="Login">
      <form onSubmit={handleSubmit}>
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" label="Login" />
      </form>
    </FormCard>
  )
}