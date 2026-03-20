export const MODULES = {
  ROLES: 'roles',
  USERS: 'users',
  BUSES: 'buses',
  ROUTES: 'routes',
  DASHBOARD: 'dashboard',
} as const;

export type ModuleName = typeof MODULES[keyof typeof MODULES];

export type ActionType = 'leer' | 'escribir' | 'editar' | 'eliminar';
