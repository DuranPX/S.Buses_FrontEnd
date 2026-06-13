/**
 * permissionUtils.ts
 *
 * Utilidades centralizadas para gestionar la sincronización entre
 * el catálogo de módulos del frontend (MODULES) y los permisos
 * almacenados en los roles del backend.
 *
 * Flujo recomendado:
 *   Backend → AuthProvider → synchronizeRolePermissions() → Context → useAuthorization()
 *
 * Esto garantiza que el rol siempre llegue completamente sincronizado
 * antes de que cualquier componente consulte permisos.
 */

import { MODULES } from '../../../shared/config/modules';
import type { ModuleName } from '../../../shared/config/modules';
import type { Permission } from '../../auth/context/AuthContext';

/**
 * Módulos que no requieren entrada en el arreglo de permisos porque
 * son rutas públicas o del sistema, visibles para cualquier usuario.
 */
export const PUBLIC_MODULES: ModuleName[] = [
  MODULES.DASHBOARD,
];

/**
 * Devuelve los módulos gestionables (todos menos los públicos/sistema).
 */
export const getManagedModules = (): ModuleName[] => {
  return Object.values(MODULES).filter(
    (m) => !PUBLIC_MODULES.includes(m as ModuleName)
  ) as ModuleName[];
};

/**
 * Genera el arreglo completo de permisos para todos los módulos
 * gestionables, con todas las acciones en false.
 *
 * Útil para inicializar un rol nuevo.
 *
 * @example
 * const permisos = buildDefaultPermissions();
 * // → [{ modulo: 'usuarios', leer: false, escribir: false, editar: false, eliminar: false }, ...]
 */
export const buildDefaultPermissions = (): Permission[] => {
  return getManagedModules().map((module) => ({
    modulo: module,
    leer: false,
    escribir: false,
    editar: false,
    eliminar: false,
  }));
};

/**
 * Compara el catálogo MODULES contra un arreglo de permisos dado
 * y devuelve los módulos gestionables que no tienen entrada en permisos.
 *
 * @param permisos Arreglo de permisos actual del rol.
 * @returns Lista de nombres de módulos faltantes.
 *
 * @example
 * const missing = getMissingModules(role.permisos);
 * // → ['analiticas', 'turno_conductor']
 */
export const getMissingModules = (permisos: Permission[]): ModuleName[] => {
  const managed = getManagedModules();
  const registered = new Set(permisos.map((p) => p.modulo));
  return managed.filter((m) => !registered.has(m));
};

/**
 * Sincroniza un arreglo de permisos existente con TODOS los módulos
 * gestionables definidos en MODULES.
 *
 * - Los permisos existentes se conservan intactos.
 * - Los módulos faltantes se agregan con todas las acciones en false.
 * - Los módulos en permisos que ya no existan en MODULES se descartan
 *   (módulos obsoletos no se envían al backend).
 *
 * @param permisos Permisos actuales del rol (pueden estar incompletos).
 * @returns Arreglo sincronizado y completo.
 *
 * @example
 * const synced = synchronizeRolePermissions(role.permisos);
 * // Todos los módulos de MODULES están garantizados en el resultado.
 */
export const synchronizeRolePermissions = (permisos: Permission[]): Permission[] => {
  const missing = getMissingModules(permisos);

  if (missing.length > 0) {
    console.info(
      `[permissionUtils] synchronizeRolePermissions: Se agregaron ${missing.length} módulo(s) faltante(s):`,
      missing
    );
  }

  // Construir mapa de permisos existentes para lookup O(1)
  const existingMap = new Map<string, Permission>(
    permisos.map((p) => [p.modulo, p])
  );

  // Reconstruir el arreglo en orden canónico (orden de MODULES)
  return getManagedModules().map((module) => {
    return existingMap.get(module) ?? {
      modulo: module,
      leer: false,
      escribir: false,
      editar: false,
      eliminar: false,
    };
  });
};
