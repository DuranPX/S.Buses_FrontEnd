import { showAlert } from "../../../shared/utils/alerts";
import { securityApi } from "../../../api/api";
import type { AxiosError } from "axios";

export interface LoginData {
  email: string
  password: string
  recaptchaToken?: string
}

export interface RegisterData {
  name: string
  lastName: string
  email: string
  password: string
  phone: string
  address?: string
  recaptchaToken?: string
}

const handleApiError = (error: unknown, defaultMessage: string) => {
  const err = error as AxiosError<{ message?: string, errors?: Record<string, string> }>;
  let message = defaultMessage;
  
  if (err.response?.data) {
    if (err.response.data.message) {
      message = err.response.data.message;
    } else if (err.response.data.errors) {
      const firstError = Object.values(err.response.data.errors)[0];
      if (firstError) message = firstError;
    }
  }
  
  showAlert.error("Error", message);
  throw error;
};

export const login = async (data: LoginData) => {
  try {
    const response = await securityApi.post("/auth/login", data);
    
    let token = null;
    let message = null;

    if (typeof response.data === 'string') {
      if (response.data.startsWith('eyJ')) {
        token = response.data;
      } else {
        message = response.data;
      }
    } else if (response.data) {
      token = response.data.token;
      message = response.data.message;
    }
    
    if (token) {
      localStorage.setItem("token", token);
      return { token, message: message || "Autenticado" };
    }
    
    // Si no hay token, probablemente es la redirección de 2FA
    return { token: null, message: message || JSON.stringify(response.data) };
  } catch (error) {
    handleApiError(error, "Credenciales inválidas o error de servidor.");
  }
};

export const register = async (data: RegisterData) => {
  try {
    const response = await securityApi.post("/auth/register", data);
    return response.data;
  } catch (error) {
    handleApiError(error, "No se pudo crear la cuenta. Verifica los datos.");
  }
};

export const send2faCode = async (email: string, proposito: "LOGIN" | "REGISTRO" = "LOGIN") => {
  try {
    const response = await securityApi.post("/auth/2fa/send", { email, proposito });
    return response.data;
  } catch (error) {
    handleApiError(error, "Error al enviar el código 2FA.");
  }
}

export const verify2faCode = async (email: string, codigo: string) => {
  try {
    const response = await securityApi.post("/auth/2fa/verify", { email, codigo });
    
    let token = null;
    if (typeof response.data === 'string') {
      if (response.data.startsWith('eyJ')) {
        token = response.data;
      }
    } else if (response.data) {
      token = response.data.token;
    }

    if (token) {
      localStorage.setItem("token", token);
      return { token };
    }
    
    return { token: null, raw: response.data };
  } catch (error) {
    handleApiError(error, "Código 2FA inválido o expirado.");
  }
}

export const sendRecoveryCode = async (email: string) => {
  try {
    const response = await securityApi.post("/auth/recovery/send", { email });
    return response.data;
  } catch (error) {
    handleApiError(error, "Error al solicitar la recuperación.");
  }
}

export const verifyRecoveryCode = async (data: any) => {
  try {
    const response = await securityApi.post("/auth/recovery/verify", data);
    return response.data;
  } catch (error) {
    handleApiError(error, "Error al actualizar la contraseña.");
  }
}

export const selectRole = async (roleName: string) => {
  try {
    const response = await securityApi.post("/auth/select-role", { role: roleName });
    
    // La API devuelve { token: "...", role: {...} }
    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error) {
    handleApiError(error, "Error al seleccionar el rol, es posible que el token haya expirado.");
    throw error;
  }
}

export const getMe = async () => {
  const response = await securityApi.get("/auth/me");
  return response.data;
};

export const loginWithOAuth = async (provider: string, _token: string) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const jwt = "mock-oauth-token-" + Math.random().toString(36).substring(7);
  localStorage.setItem("token", jwt);
  showAlert.success("OAuth Exitoso", `Conectado correctamente con ${provider}`);
  return { token: jwt };
};

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/";
};
