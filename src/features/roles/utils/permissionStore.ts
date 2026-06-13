import type { Role } from '../../auth/context/AuthContext';

/**
 * permissionStore.ts
 *
 * Store en memoria para mantener el rol activo y sus permisos sincronizados.
 * Actúa como única fuente de verdad para la autorización en componentes y servicios puros
 * (como el wrapper authorizedBusinessApi) que no tienen acceso al contexto de React.
 */

let activeRoleMemory: Role | null = null;

export const permissionStore = {
  /**
   * Obtiene el rol activo actual desde la memoria.
   */
  getActiveRole: (): Role | null => {
    return activeRoleMemory;
  },

  /**
   * Actualiza el rol activo en memoria.
   * Debe ser invocado por AuthProvider cada vez que cambie la sesión.
   */
  setActiveRole: (role: Role | null): void => {
    activeRoleMemory = role;
  },
};
