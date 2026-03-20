import { useAuth } from "../../auth/hooks/useAuth";
import type { ModuleName, ActionType } from "../../../shared/config/modules";

export const useAuthorization = () => {
  const { activeRole } = useAuth();

  /**
   * Checks if the active role has a specific permission for a module.
   * @param module The module name (e.g., 'roles', 'users', 'buses').
   * @param action The action type ('leer', 'escribir', 'editar', 'eliminar').
   * @returns boolean
   */
  const can = (module: ModuleName, action: ActionType): boolean => {
    if (!activeRole || !activeRole.activo) return false;

    // Admin has full permissions (short-circuit for simplicity if needed, 
    // but better to check the actual permissions list in the role)
    // if (activeRole.name === 'ADMIN') return true;

    const permission = activeRole.permisos.find((p: any) => p.modulo === module);
    
    if (!permission) return false;

    return !!permission[action];
  };

  /**
   * Shortcut to check if the user has any permission in a module that starts with 'leer'.
   * Useful for sidebar visibility.
   */
  const canRead = (module: ModuleName): boolean => can(module, 'leer');

  return {
    can,
    canRead,
    activeRole,
  };
};

export default useAuthorization;
