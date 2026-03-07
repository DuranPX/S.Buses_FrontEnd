import api from "../services/api"

export const setupInterceptors = () => {

  api.interceptors.request.use(
    (config) => {

      const token = localStorage.getItem("token")

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log("Token agregado al request:", token)
      }

      return config
    },

    (error) => {
      return Promise.reject(error)
    }
  )

}