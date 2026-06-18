/**
 * authorizedBusinessApi.ts
 *
 * Wrapper alrededor de businessApi que implementa validación de permisos
 * antes de ejecutar la petición HTTP.
 * Utiliza permissionStore como fuente de verdad del rol actual.
 */

import { businessApi } from '../../../api/api';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { showAlert } from '../../../shared/utils/alerts';
import type { ModuleName, ActionType } from '../../../shared/config/modules';
import { permissionStore } from './permissionStore';

export class PermissionDeniedError extends Error {
  public module: string;
  public action: string;

  constructor(module: string, action: string) {
    super(`Permiso denegado: Se requiere permiso '${action}' en el módulo '${module}'.`);

    this.name = 'PermissionDeniedError';
    this.module = module;
    this.action = action;
  }
}

/**
 * Valida si el rol activo en memoria tiene permiso para una acción específica.
 * Reutiliza la misma lógica central que useAuthorization.
 */
export const authorizeBusinessAction = (module: ModuleName, action: ActionType): boolean => {
  const activeRole = permissionStore.getActiveRole();

  if (!activeRole || !activeRole.activo) return false;

  // Admin tiene acceso total
  

  // Regla de negocio parcial: Ciudadano puede leer cartera siempre
  const isCiudadano =
    activeRole.name === 'Ciudadano' ||
    activeRole.name === 'CIUDADANO' ||
    activeRole.name?.toLowerCase() === 'ciudadano';

  if (isCiudadano && module === 'cartera' && action === 'leer') return true;

  // Búsqueda en los permisos sincronizados
  const permission = activeRole.permisos.find((p: any) => p.modulo === module);
  if (!permission) return false;

  return !!permission[action];
};

const handleUnauthorized = (module: ModuleName, action: ActionType, url: string) => {
  console.warn(`[AUTH] Permiso denegado:\nmódulo=${module}\nacción=${action}\nendpoint=${url}`);
  showAlert.error('Acceso Denegado', `No tienes permiso para realizar esta acción (${action} en ${module}).`);
  throw new PermissionDeniedError(module, action);
};

export const authorizedBusinessApi = {
  get: <T = any, R = AxiosResponse<T>>(module: ModuleName, url: string, config?: AxiosRequestConfig): Promise<R> => {
    if (!authorizeBusinessAction(module, 'leer')) {
      handleUnauthorized(module, 'leer', url);
    }
    return businessApi.get<T, R>(url, config);
  },

  post: <T = any, R = AxiosResponse<T>>(module: ModuleName, url: string, data?: any, config?: AxiosRequestConfig): Promise<R> => {
    if (!authorizeBusinessAction(module, 'escribir')) {
      handleUnauthorized(module, 'escribir', url);
    }
    return businessApi.post<T, R>(url, data, config);
  },

  put: <T = any, R = AxiosResponse<T>>(module: ModuleName, url: string, data?: any, config?: AxiosRequestConfig): Promise<R> => {
    if (!authorizeBusinessAction(module, 'editar')) {
      handleUnauthorized(module, 'editar', url);
    }
    return businessApi.put<T, R>(url, data, config);
  },

  patch: <T = any, R = AxiosResponse<T>>(module: ModuleName, url: string, data?: any, config?: AxiosRequestConfig): Promise<R> => {
    if (!authorizeBusinessAction(module, 'editar')) {
      handleUnauthorized(module, 'editar', url);
    }
    return businessApi.patch<T, R>(url, data, config);
  },

  delete: <T = any, R = AxiosResponse<T>>(module: ModuleName, url: string, config?: AxiosRequestConfig): Promise<R> => {
    if (!authorizeBusinessAction(module, 'eliminar')) {
      handleUnauthorized(module, 'eliminar', url);
    }
    return businessApi.delete<T, R>(url, config);
  }
};
