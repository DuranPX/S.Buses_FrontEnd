import './index.css'
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { AuthProvider } from "./features/auth/context/AuthContext"
import { AuthFlowProvider } from "./features/auth/context/AuthFlowContext"
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
      <AuthFlowProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AuthFlowProvider>
    </GoogleReCaptchaProvider>
  </React.StrictMode>
)