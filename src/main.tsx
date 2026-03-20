import './index.css'
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { AuthProvider } from "./features/auth/context/AuthContext"
import { AuthFlowProvider } from "./features/auth/context/AuthFlowContext"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthFlowProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AuthFlowProvider>
  </React.StrictMode>
)