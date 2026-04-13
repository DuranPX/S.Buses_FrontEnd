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
  confirmPassword: string
  phone: string
  address?: string
  recaptchaToken?: string
}

const handleApiError = (error: unknown, defaultMessage: string) => {
  const err = error as AxiosError<{ message?: string, error?: string, errors?: Record<string, string> }>;
  let message = defaultMessage;
  
  if (err.response?.data) {
    // Nuevo formato: { error: "..." } o { message: "..." }
    if (err.response.data.error) {
      message = err.response.data.error;
    } else if (err.response.data.message) {
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

    // Nuevo formato: respuestas son JSON { token, message, error }
    if (response.data && typeof response.data === 'object') {
      token = response.data.token;
      message = response.data.message;
    } else if (typeof response.data === 'string') {
      // Backward compatibility por si el backend aún devuelve string en algún caso
      if (response.data.startsWith('eyJ')) {
        token = response.data;
      } else {
        message = response.data;
      }
    }
    
    if (token) {
      localStorage.setItem("token", token);
      return { token, message: message || "Autenticado" };
    }
    
    // Si no hay token, probablemente es la redirección de 2FA
    return { token: null, message: message || "Verificación requerida" };
  } catch (error) {
    handleApiError(error, "Email o contraseña incorrectos.");
  }
};

export const register = async (data: RegisterData) => {
  try {
    const response = await securityApi.post("/auth/register", data);
    // Nuevo formato: { message: "Usuario creado..." }
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
    let message = null;

    // Nuevo formato: { token: "eyJ..." } o { message: "Cuenta activada..." }
    if (response.data && typeof response.data === 'object') {
      token = response.data.token;
      message = response.data.message;
    } else if (typeof response.data === 'string') {
      if (response.data.startsWith('eyJ')) {
        token = response.data;
      }
    }

    if (token) {
      localStorage.setItem("token", token);
      return { token, message };
    }
    
    return { token: null, message, raw: response.data };
  } catch (error) {
    // Extraer intentosRestantes del error si viene
    const err = error as AxiosError<{ error?: string, intentosRestantes?: number }>;
    const intentosRestantes = err.response?.data?.intentosRestantes;
    
    handleApiError(error, "Código 2FA inválido o expirado.");
    
    // Re-throw con datos extra para que el componente pueda leer intentosRestantes
    // (handleApiError ya hace throw, así que esto es por si se modifica)
    return { token: null, intentosRestantes };
  }
}

export const sendRecoveryCode = async (email: string, recaptchaToken?: string) => {
  try {
    const response = await securityApi.post("/auth/recovery/send", { email, recaptchaToken });
    // Respuesta siempre genérica: { message: "Si el email existe..." }
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

export const logout = async () => {
  try {
    // Notificar al backend (para logging/auditoría)
    await securityApi.post("/auth/logout");
  } catch (e) {
    // No bloquear el logout si falla la petición
    console.warn('Error en logout del servidor:', e);
  } finally {
    // SIEMPRE limpiar el estado local
    localStorage.removeItem("token");
    localStorage.removeItem("activeRole");
    window.location.href = "/";
  }
};

export const searchUsers = async (query: string) => {
  try {
    const response = await securityApi.get(`/api/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    handleApiError(error, "Error al buscar usuarios.");
  }
};

export const unlinkAuthExternal = async (userId: string, provider: string) => {
  try {
    const response = await securityApi.delete(`/api/users/${userId}/auth-external/${provider}`);
    return response.data;
  } catch (error) {
    handleApiError(error, "No se pudo desvincular la cuenta externa.");
  }
};

export const updateUserProfile = async (userId: string, data: { phone?: string; address?: string; name?: string; lastName?: string }) => {
  try {
    const response = await securityApi.put(`/api/users/${userId}`, data);
    return response.data;
  } catch (error) {
    handleApiError(error, "No se pudo actualizar el perfil.");
  }
};

