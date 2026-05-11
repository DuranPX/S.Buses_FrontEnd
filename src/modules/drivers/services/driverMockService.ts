import { withDelay } from '../../../adapters/mockAdapter';
import { MOCK_TURNOS } from '../../../mocks/trips.mock';
import type { DriverShift, BusCondition } from '../types/driver.types';

let memoryShifts = [...MOCK_TURNOS] as DriverShift[];

export const driverMockService = {
  /**
   * Obtiene el turno actual del conductor (mockeado para el usuario activo)
   */
  getCurrentShift: async (): Promise<DriverShift | null> => {
    await withDelay(null, 600);
    // Para simplificar, buscamos un turno asignado al conductor "c-001" que esté programado o en curso
    const shift = memoryShifts.find(t => t.conductor_id === 'c-001' && t.estado !== 'Finalizado');
    return shift || null;
  },

  /**
   * Inicia el turno enviando el estado del bus
   */
  startShift: async (shiftId: string, condition: BusCondition): Promise<DriverShift> => {
    await withDelay(null, 1200);
    
    const index = memoryShifts.findIndex(t => t.id === shiftId);
    if (index === -1) throw new Error('Turno no encontrado.');

    if (condition.luces === 'Falla' || condition.frenos === 'Revisar') {
      throw new Error('El bus no está en condiciones seguras para operar. Contacte a mantenimiento.');
    }

    const updated = {
      ...memoryShifts[index],
      estado: 'En_Curso' as const,
      fecha_inicio_real: new Date().toISOString(),
      observaciones: `Condición inicial: Combustible ${condition.nivel_combustible}%, Limpieza: ${condition.limpieza}`
    };

    memoryShifts[index] = updated;
    return updated;
  },

  /**
   * Finaliza el turno
   */
  endShift: async (shiftId: string): Promise<void> => {
    await withDelay(null, 800);
    const index = memoryShifts.findIndex(t => t.id === shiftId);
    if (index > -1) {
      memoryShifts[index].estado = 'Finalizado';
      memoryShifts[index].fecha_fin_real = new Date().toISOString();
    }
  }
};
