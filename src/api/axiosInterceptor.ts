import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

import { jwtDecode } from "jwt-decode";
import axios from "axios";

// flag and queue para prevenir múltiples llamadas de refresh simultáneas
let isRefreshing = false;
let failedQueue: Array<{ resolve: (val?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupInterceptors = (api: AxiosInstance) => {
  // Interceptor: Inyectar Token Bearer y Refresh Automático
  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      let token = localStorage.getItem("token");

      // No interceptar login o refresh
      if (config.url?.includes("/auth/login") || config.url?.includes("/auth/refresh")) {
        if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
        return config;
      }

      if (token) {
        try {
          const decoded = jwtDecode<{ exp: number }>(token);
          const currentTime = Math.floor(Date.now() / 1000);

          // Si expira en menos de 1 minuto (60s)
          if (decoded.exp && (decoded.exp - currentTime) < 60) {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
              if (!isRefreshing) {
                isRefreshing = true;
                try {
                  const msSecurityUrl = import.meta.env.VITE_MS_SECURITY_API || "http://localhost:8080";
                  const response = await axios.post(`${msSecurityUrl}/auth/refresh`, { refreshToken });
                  
                  const { token: newToken, refreshToken: newRefreshToken } = response.data;
                  localStorage.setItem("token", newToken);
                  localStorage.setItem("refreshToken", newRefreshToken);
                  token = newToken;
                  
                  processQueue(null, newToken);
                } catch (error) {
                  processQueue(error, null);
                  localStorage.removeItem("token");
                  localStorage.removeItem("refreshToken");
                  localStorage.removeItem("activeRole");
                  window.location.href = "/login?reason=session_expired";
                  return Promise.reject(error);
                } finally {
                  isRefreshing = false;
                }
              } else {
                // Esperar a que el refresh termine
                return new Promise((resolve, reject) => {
                  failedQueue.push({ resolve, reject });
                }).then(newToken => {
                  if (config.headers && newToken) {
                    config.headers.Authorization = `Bearer ${newToken}`;
                  }
                  return config;
                }).catch(err => Promise.reject(err));
              }
            }
          }
        } catch (error) {
          console.error("Error decodificando token", error);
        }
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor: Manejo de errores
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        // No redirigir si es un endpoint de background/opcional
        const url = error.config?.url ?? "";
        const isSilentEndpoint = url.includes("/auth/sync-user");
        if (!isSilentEndpoint && !window.location.pathname.includes("/login")) {
          import("../shared/utils/alerts").then(({ showAlert }) => {
            showAlert.warning("Sesión expirada", "Por favor, inicia sesión de nuevo.");
            setTimeout(() => window.location.href = "/login?reason=session_expired", 2000);
          });
        }
      }

      if (error.response?.status === 403) {
        import("../shared/utils/alerts").then(({ showAlert }) => {
          const message = error.response?.data?.error || "No tienes permisos para realizar esta acción.";
          showAlert.error("Acceso Denegado", message);
        });
      }

      return Promise.reject(error);
    }
  );
};
