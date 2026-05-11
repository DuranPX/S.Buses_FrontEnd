import { withDelay } from '../../../../adapters/mockAdapter';

export interface MockDriver {
  id: string;
  nombres: string;
  apellidos: string;
  licencia: string;
  estado: 'Activo' | 'Inactivo' | 'Suspendido';
  empresa_nombre?: string;
  calificacion?: number;
}

const MOCK_DRIVERS: MockDriver[] = [
  { id: 'c-001', nombres: 'Carlos', apellidos: 'Ramírez', licencia: 'LIC-9876543', estado: 'Activo', empresa_nombre: 'TransManizales', calificacion: 4.8 },
  { id: 'c-002', nombres: 'Alejandro', apellidos: 'Torres', licencia: 'LIC-1234567', estado: 'Activo', empresa_nombre: 'Unitrans', calificacion: 4.5 },
  { id: 'c-003', nombres: 'Javier', apellidos: 'Gómez', licencia: 'LIC-5554443', estado: 'Suspendido', empresa_nombre: 'TransManizales', calificacion: 3.2 },
  { id: 'c-004', nombres: 'Martín', apellidos: 'López', licencia: 'LIC-9998887', estado: 'Activo', empresa_nombre: 'Unitrans', calificacion: 4.9 },
  { id: 'c-005', nombres: 'Luis', apellidos: 'Martínez', licencia: 'LIC-1112223', estado: 'Inactivo', empresa_nombre: 'GranCaldas', calificacion: 4.0 },
];

export const driversMockService = {
  getAll: async (): Promise<MockDriver[]> => {
    await withDelay(null, 500);
    return MOCK_DRIVERS;
  }
};
