import api from "../../../api/api"
import { showAlert } from "../../../shared/utils/alerts";

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
  try {
    const response = await api.post("/auth/login", data);
    const { token, user } = response.data;
    
    if (token) {
      localStorage.setItem("token", token);
      showAlert.success("¡Bienvenido!", `Hola de nuevo, ${user?.name || 'Usuario'}`);
    }
    
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Credenciales inválidas o error de conexión.";
    showAlert.error("Error de Acceso", message);
    throw error;
  }
}

export const register = async (data: RegisterData) => {
  try {
    const response = await api.post("/auth/register", data);
    showAlert.success("Registro Exitoso", "Tu cuenta ha sido creada. Ya puedes iniciar sesión.");
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "No se pudo completar el registro.";
    showAlert.error("Error de Registro", message);
    throw error;
  }
}

export const loginWithOAuth = async (provider: string, token: string) => {
  try {
    // Esta ruta debe existir en tu backend para procesar el token del proveedor
    const response = await api.post(`/auth/oauth/${provider}`, { token });
    const { token: jwt, user } = response.data;
    
    if (jwt) {
      localStorage.setItem("token", jwt);
      showAlert.success("OAuth Exitoso", `Conectado correctamente como ${user?.name || provider}`);
    }
    
    return response.data;
  } catch (error: any) {
    showAlert.error("Error OAuth", `No se pudo autenticar con ${provider}.`);
    throw error;
  }
}

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/";
}
