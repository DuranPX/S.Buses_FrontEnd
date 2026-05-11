import axios from "axios";
import { setupInterceptors } from "./axiosInterceptor";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const securityApi = axios.create({
  baseURL: import.meta.env.VITE_MS_SECURITY_API,
  headers: {
    "Content-Type": "application/json",
  },
});

// ----------------------------------------------------------------
// ms-business API
// TODO: descomentar baseURL cuando los endpoints del backend estén listos.
// Los servicios mock NO usan esta instancia; la usarán los servicios reales.
// ----------------------------------------------------------------
export const businessApi = axios.create({
  // baseURL: import.meta.env.VITE_MS_BUSINESS_API, // ← activar con backend real
  baseURL: 'http://localhost:3001', // placeholder
  headers: {
    "Content-Type": "application/json",
  },
});

// interceptores
setupInterceptors(api);
setupInterceptors(securityApi);
setupInterceptors(businessApi);

export default api;
