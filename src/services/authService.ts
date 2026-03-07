import api from "../services/api"

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
}

export const login = async (data: LoginData) => {
  const response = await api.post("/auth/login", data)

  const token = response.data.token

  localStorage.setItem("token", token)

  return response.data
}

export const register = async (data: RegisterData) => {
  const response = await api.post("/auth/register", data)

  return response.data
}

export const logout = () => {
  localStorage.removeItem("token")
}