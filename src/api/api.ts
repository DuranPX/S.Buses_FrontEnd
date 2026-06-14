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

export const businessApi = axios.create({
  baseURL: import.meta.env.VITE_MS_BUSINESS_API,
  headers: {
    "Content-Type": "application/json",
  },
});

export const notificationsApi = axios.create({
  baseURL: import.meta.env.VITE_MS_NOTIFICATIONS_API,
  headers: {
    "Content-Type": "application/json",
  },
});

// interceptores
setupInterceptors(api);
setupInterceptors(securityApi);
setupInterceptors(businessApi);
setupInterceptors(notificationsApi);

export default api;
