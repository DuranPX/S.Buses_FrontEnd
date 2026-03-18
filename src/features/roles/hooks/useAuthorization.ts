import { useAuth } from "../../auth/hooks/useAuth";

export const useAuthorization = () => {
  const { user } = useAuth();

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const hasPermission = (permission: string) => {
    // Aquí iría la lógica para verificar permisos granulares
    // Por ahora simulamos que el admin tiene todo
    if (user?.role === "ADMIN") return true;
    
    // Ejemplo de permisos mockeados
    const mockPermissions: Record<string, string[]> = {
      "USER": ["VIEW_DASHBOARD"],
      "OPERATOR": ["VIEW_DASHBOARD", "EDIT_BUSES"],
    };

    const userPermissions = user?.role ? mockPermissions[user.role] || [] : [];
    return userPermissions.includes(permission);
  };

  return {
    hasRole,
    hasPermission,
    role: user?.role,
  };
};

export default useAuthorization;
