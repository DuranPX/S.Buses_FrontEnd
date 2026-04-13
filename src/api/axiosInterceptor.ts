import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

export const setupInterceptors = (api: AxiosInstance) => {
  // Interceptor: Inyectar Token Bearer
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

  // Response Interceptor: Manejo de errores
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        if (!window.location.pathname.includes("/login")) {
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
