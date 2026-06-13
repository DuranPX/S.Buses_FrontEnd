import { useAuth } from "../../auth/hooks/useAuth";
import type { ModuleName, ActionType } from "../../../shared/config/modules";

/**
 * Hook de autorización.
 *
 * El rol activo llega al contexto ya sincronizado con todos los módulos
 * de MODULES (via synchronizeRolePermissions en AuthContext).
 * Por eso, este hook NO necesita realizar ninguna sincronización adicional,
 * lo que evita cómputo redundante en cada render.
 *
 * Regla de negocio explícita conservada:
 *   - Admin: acceso total al sistema sin necesidad de configurar permisos manualmente.
 *
 * Las excepciones hardcodeadas previas de Ciudadano/cartera han sido eliminadas.
 * El acceso de esos roles queda controlado exclusivamente por los permisos del backend.
 */
export const useAuthorization = () => {
  const { activeRole } = useAuth();

  /**
   * Verifica si el rol activo tiene un permiso específico sobre un módulo.
   * @param module Nombre del módulo (ej. 'roles', 'usuarios', 'buses').
   * @param action Acción a verificar ('leer', 'escribir', 'editar', 'eliminar').
   * @returns boolean
   */
  const can = (module: ModuleName, action: ActionType): boolean => {
    if (!activeRole || !activeRole.activo) return false;

    // Regla de negocio: Admin tiene acceso total al sistema.
    // Evita tener que configurar manualmente decenas de permisos.
    if (
      activeRole.name === 'Admin' ||
      activeRole.name === 'ADMIN' ||
      activeRole.name?.toLowerCase() === 'admin'
    ) {
      return true;
    }

    // Regla de negocio parcial: el rol Ciudadano siempre puede *leer* su cartera,
    // independientemente de lo que diga el backend. Las demás acciones sobre cartera
    // quedan controladas por los permisos del rol.
    const isCiudadano =
      activeRole.name === 'Ciudadano' ||
      activeRole.name === 'CIUDADANO' ||
      activeRole.name?.toLowerCase() === 'ciudadano';

    if (isCiudadano && module === 'cartera' && action === 'leer') return true;

    // A partir de aquí, el rol ya llegó sincronizado desde AuthContext.
    // Si el módulo no tiene entrada, significa que no tiene permiso (false por defecto).
    const permission = activeRole.permisos.find((p: any) => p.modulo === module);

    if (!permission) return false;

    return !!permission[action];
  };

  /**
   * Atajo para verificar si el rol activo puede leer un módulo.
   * Útil para controlar visibilidad en el sidebar.
   */
  const canRead = (module: ModuleName): boolean => can(module, 'leer');

  return {
    can,
    canRead,
    activeRole,
  };
};

export default useAuthorization;
