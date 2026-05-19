import { withDelay } from '../../../adapters/mockAdapter';
import { MOCK_TURNOS } from '../../../mocks/trips.mock';
import type { DriverShift, BusCondition } from '../types/driver.types';

let memoryShifts: DriverShift[] = MOCK_TURNOS.map(t => ({
  ...t,
  estado: t.estado === 'Programado' ? 'PROGRAMADO'
        : t.estado === 'En_Curso'   ? 'EN_CURSO'
        : 'FINALIZADO',
}));

export const driverMockService = {
  /**
   * Obtiene el turno actual del conductor (mockeado para el usuario activo)
   */
  getCurrentShift: async (): Promise<DriverShift | null> => {
    await withDelay(null, 600);
    // Para simplificar, buscamos un turno asignado al conductor "c-001" que esté programado o en curso
    const shift = memoryShifts.find(t => t.conductor_id === 'c-001' && t.estado !== 'FINALIZADO');
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
      estado: 'EN_CURSO' as const,
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
      memoryShifts[index].estado = 'FINALIZADO';
      memoryShifts[index].fecha_fin_real = new Date().toISOString();
    }
  }
};
