import { useAuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const { user, activeRole, isAuthenticated, isLoading, showRoleModal, login, logout, setActiveRole, setShowRoleModal } = useAuthContext();

  return {
    user,
    activeRole,
    isAuthenticated,
    isLoading,
    showRoleModal,
    login,
    logout,
    setActiveRole,
    setShowRoleModal,
  };
};
