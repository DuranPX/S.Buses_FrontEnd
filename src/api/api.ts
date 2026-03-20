import axios from "axios";
import { setupInterceptors } from "./axiosInterceptor";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// interceptores
setupInterceptors(api);

export default api;
