import { useAuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const { user, activeRole, isAuthenticated, isLoading, showRoleModal, syncSession, logout, setActiveRole, setShowRoleModal } = useAuthContext();

  return {
    user,
    activeRole,
    isAuthenticated,
    isLoading,
    showRoleModal,
    syncSession,
    logout,
    setActiveRole,
    setShowRoleModal,
  };
};
