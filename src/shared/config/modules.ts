export const MODULES = {
  DASHBOARD: 'dashboard',
  USUARIOS: 'usuarios',
  ROLES: 'roles',
  EMPRESAS: 'empresas',
  BUSES: 'buses',
  CONDUCTORES: 'conductores',
  RUTAS: 'rutas',
  PARADEROS: 'paraderos',
  PROGRAMACIONES: 'programaciones',
  TURNOS: 'turnos',
  CLIENTES: 'clientes',
  PAGOS: 'pagos',
  BOLETOS: 'boletos',
  VALIDACIONES: 'validaciones',
  INCIDENTES: 'incidentes',
  MENSAJES: 'mensajes',
  GRUPOS: 'grupos',
  RESENAS: 'resenas',
  RECARGAS: 'recargas',
} as const;

export type ModuleName = typeof MODULES[keyof typeof MODULES];

export type ActionType = 'leer' | 'escribir' | 'editar' | 'eliminar';
