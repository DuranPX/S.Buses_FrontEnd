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
  // Módulos nuevos — Fase 2-6
  VIAJES: 'viajes',
  CARTERA: 'cartera',
  ANALITICAS: 'analiticas',
  TURNO_CONDUCTOR: 'conductor',
} as const;

export type ModuleName = typeof MODULES[keyof typeof MODULES];

export type ActionType = 'leer' | 'escribir' | 'editar' | 'eliminar';
