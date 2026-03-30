import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthFlowState {
  requires2FA: boolean;
  email: string;
  expiresAt: number;
  attemptsLeft: number;
  resetToken?: string;
  purpose?: "LOGIN" | "REGISTRO";
}

interface AuthFlowContextType {
  authFlow: AuthFlowState;
  setAuthFlow: (state: Partial<AuthFlowState>) => void;
  clearAuthFlow: () => void;
  decrementAttempts: () => void;
}

const initialState: AuthFlowState = {
  requires2FA: false,
  email: "",
  expiresAt: 0,
  attemptsLeft: 3,
  purpose: "LOGIN",
};

const AuthFlowContext = createContext<AuthFlowContextType | undefined>(undefined);

export const AuthFlowProvider = ({ children }: { children: ReactNode }) => {
  const [authFlow, setAuthFlowState] = useState<AuthFlowState>(initialState);

  const setAuthFlow = (state: Partial<AuthFlowState>) => {
    setAuthFlowState((prev) => ({ ...prev, ...state }));
  };

  const clearAuthFlow = () => {
    setAuthFlowState(initialState);
  };

  const decrementAttempts = () => {
    setAuthFlowState((prev) => ({
      ...prev,
      attemptsLeft: Math.max(0, prev.attemptsLeft - 1),
    }));
  };

  return (
    <AuthFlowContext.Provider value={{ authFlow, setAuthFlow, clearAuthFlow, decrementAttempts }}>
      {children}
    </AuthFlowContext.Provider>
  );
};

export const useAuthFlow = () => {
  const context = useContext(AuthFlowContext);
  if (context === undefined) {
    throw new Error("useAuthFlow debe usarse dentro de AuthFlowProvider");
  }
  return context;
};
