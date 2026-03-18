import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

export const setupInterceptors = (api: AxiosInstance) => {
  // Request Interceptor: Inyectar Token Bearer
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor: Manejo de errores globales (401, etc.)
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        if (!window.location.pathname.includes("/login")) {
          import("../shared/utils/alerts").then(({ showAlert }) => {
            showAlert.warning("Sesión expirada", "Por favor, inicia sesión de nuevo.");
            setTimeout(() => window.location.href = "/login", 2000);
          });
        }
      }
      return Promise.reject(error);
    }
  );
};
