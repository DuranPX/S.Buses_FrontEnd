import { showAlert } from "../../../shared/utils/alerts";
import mockUsers from "../data/mockUsers.json";

interface LoginData {
  email: string
  password: string
  recaptchaToken?: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  recaptchaToken?: string
}

export const login = async (data: LoginData) => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 800));

  // Buscar el usuario en los mocks
  const user = mockUsers.find(u => u.email === data.email);
  
  if (user) {
    const token = "mock-jwt-token-" + Math.random().toString(36).substring(7);
    localStorage.setItem("token", token);
    // Nota: El mensaje de bienvenida ahora es manejado por el servicio de forma reactiva
    return { token, user };
  } else {
    const message = "Credenciales inválidas (Simulación Mock).";
    showAlert.error("Error de Acceso", message);
    throw new Error(message);
  }
}

export const register = async (data: RegisterData) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  showAlert.success("Registro Exitoso", "Tu cuenta ha sido creada (Simulación Mock).");
  return { success: true };
}

export const loginWithOAuth = async (provider: string, token: string) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const user = mockUsers[0];
  const jwt = "mock-oauth-token-" + Math.random().toString(36).substring(7);
  localStorage.setItem("token", jwt);
  showAlert.success("OAuth Exitoso", `Conectado correctamente como ${user.name}`);
  return { token: jwt, user };
}

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/";
}
