/**
 * permissionReport.ts
 *
 * Utilidad de diagnóstico para auditar el estado de los permisos de un rol
 * respecto al catálogo MODULES del frontend.
 *
 * Uso (en consola del navegador o en código de desarrollo):
 *
 *   import { generatePermissionReport } from '@/features/roles/utils/permissionReport';
 *   generatePermissionReport(activeRole);
 */

import { MODULES } from '../../../shared/config/modules';
import type { ModuleName } from '../../../shared/config/modules';
import type { Permission, Role } from '../../auth/context/AuthContext';
import { getManagedModules, getMissingModules, PUBLIC_MODULES } from './permissionUtils';

export interface PermissionReportResult {
  roleName: string;
  allModules: ModuleName[];
  publicModules: ModuleName[];
  managedModules: ModuleName[];
  registeredModules: string[];
  missingModules: ModuleName[];
  hardcodedPermissionLocations: string[];
}

/**
 * Genera un reporte de auditoría de permisos para un rol dado.
 *
 * El reporte incluye:
 * - Módulos definidos en MODULES
 * - Módulos encontrados en el rol
 * - Módulos faltantes
 * - Lugares donde aún existen permisos hardcodeados (lista estática documentada)
 *
 * @param role Rol a auditar
 * @returns Objeto con el resultado del reporte
 */
export const generatePermissionReport = (role: Role): PermissionReportResult => {
  const allModules = Object.values(MODULES) as ModuleName[];
  const managedModules = getManagedModules();
  const registeredModules = role.permisos.map((p: Permission) => p.modulo);
  const missingModules = getMissingModules(role.permisos);

  /**
   * Lista estática de ubicaciones donde existían permisos hardcodeados.
   * Tras la refactorización, estas excepciones han sido eliminadas o documentadas.
   *
   * Estado post-refactorización:
   * - useAuthorization.ts: ELIMINADO (Ciudadano y cartera). Solo se mantiene Admin.
   * - Sidebar.tsx: isTemporarilyBlocked() bloquea TURNOS y PROGRAMACIONES para CONDUCTOR.
   *   → Considerar mover esto a los permisos del rol en el backend.
   * - Sidebar.tsx: grupo 'Administración' solo visible para Admin por nombre.
   *   → Comportamiento intencional por UX, no por lógica de permisos.
   */
  const hardcodedPermissionLocations: string[] = [
    '[RESUELTO] useAuthorization.ts: Ciudadano → acceso a boletos/viajes (eliminado, ahora desde backend)',
    '[ACTIVO]   useAuthorization.ts: Ciudadano → cartera.leer=true (regla de negocio parcial intencional: todo ciudadano puede ver su billetera)',
    '[ACTIVO]   useAuthorization.ts: Admin → acceso total (regla de negocio intencional, se mantiene)',
    '[ACTIVO]   Sidebar.tsx: isTemporarilyBlocked() → TURNOS y PROGRAMACIONES bloqueados para CONDUCTOR (hardcoded por nombre de rol)',
    '[ACTIVO]   Sidebar.tsx: grupo Administración → solo visible para Admin (hardcoded por nombre de rol)',
  ];

  const report: PermissionReportResult = {
    roleName: role.name,
    allModules,
    publicModules: PUBLIC_MODULES,
    managedModules,
    registeredModules,
    missingModules,
    hardcodedPermissionLocations,
  };

  // Imprimir reporte formateado en consola
  console.group(`📋 Reporte de permisos — Rol: "${role.name}"`);
  console.log(`Módulos en MODULES (total):`, allModules.length, allModules);
  console.log(`Módulos públicos (excluidos de permisos):`, PUBLIC_MODULES);
  console.log(`Módulos gestionables (deben estar en permisos):`, managedModules.length, managedModules);
  console.log(`Módulos registrados en el rol:`, registeredModules.length, registeredModules);

  if (missingModules.length === 0) {
    console.log('%c✅ El rol tiene todos los módulos registrados. Sin módulos faltantes.', 'color: #22c55e; font-weight: bold;');
  } else {
    console.warn(`⚠️ Módulos faltantes (${missingModules.length}):`, missingModules);
  }

  console.group('📌 Ubicaciones con permisos hardcodeados:');
  hardcodedPermissionLocations.forEach((loc) => {
    if (loc.startsWith('[RESUELTO]')) {
      console.log('%c' + loc, 'color: #22c55e;');
    } else {
      console.warn(loc);
    }
  });
  console.groupEnd();

  console.groupEnd();

  return report;
};
