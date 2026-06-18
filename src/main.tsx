import './index.css'
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { AuthProvider } from "./features/auth/context/AuthContext"
import { AuthFlowProvider } from "./features/auth/context/AuthFlowContext"
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3"
import { SocketProvider } from "./websocket/providers/SocketProvider"
import { WalletProvider } from "./modules/wallet/context/WalletContext"
import { NotificationsSocketProvider } from "./notifications/NotificationsSocketProvider"
import { StopAlertsProvider } from "./notifications/StopAlertsProvider"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
      <AuthFlowProvider>
        <AuthProvider>
          <WalletProvider>
            <SocketProvider>
              <NotificationsSocketProvider>
                <StopAlertsProvider>
                  <App />
                </StopAlertsProvider>
              </NotificationsSocketProvider>
            </SocketProvider>
          </WalletProvider>
        </AuthProvider>
      </AuthFlowProvider>
    </GoogleReCaptchaProvider>
  </React.StrictMode>
)