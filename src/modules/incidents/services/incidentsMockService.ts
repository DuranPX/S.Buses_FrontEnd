import { withDelay, mockUUID } from '../../../adapters/mockAdapter';
import { MOCK_INCIDENTES } from '../../../mocks/incidents.mock';
import type { Incident } from '../types/incident.types';
import { WS_EVENTS } from '../../../websocket/events';
import { appSocket, isMockSocket } from '../../../websocket/socket';

let memoryIncidents = MOCK_INCIDENTES.map(i => ({
  id: i.id,
  reportador_id: i.conductor_id || 'u-001',
  bus_id: i.bus_id,
  ruta_id: null,
  tipo: i.tipo,
  descripcion: i.descripcion,
  latitud: i.latitud,
  longitud: i.longitud,
  estado: i.estado === 'Pendiente' ? 'Reportado' : i.estado,
  evidencia_url: i.fotos?.[0]?.url || null,
  fecha_reporte: i.fecha_reporte,
  reportador_nombre: i.conductor_nombre,
  bus_placa: i.bus_placa
})) as Incident[];

export const incidentsMockService = {
  /**
   * Obtiene todos los incidentes (para monitoreo admin)
   */
  getAll: async (): Promise<Incident[]> => {
    await withDelay(null, 600);
    return [...memoryIncidents].sort((a, b) => new Date(b.fecha_reporte).getTime() - new Date(a.fecha_reporte).getTime());
  },

  /**
   * Obtiene los incidentes reportados por el usuario actual
   */
  getMyIncidents: async (): Promise<Incident[]> => {
    await withDelay(null, 500);
    return memoryIncidents
      .filter(i => i.reportador_id === 'u-001' || i.reportador_id === 'c-001') // Simulamos ciudadano/conductor actual
      .sort((a, b) => new Date(b.fecha_reporte).getTime() - new Date(a.fecha_reporte).getTime());
  },

  /**
   * Reporta un nuevo incidente
   */
  reportIncident: async (
    data: Omit<Incident, 'id' | 'estado' | 'fecha_reporte' | 'evidencia_url'>,
    file?: File
  ): Promise<Incident> => {
    await withDelay(null, 1500); // Simulando subida de archivo pesada

    // Simulamos la URL del archivo
    let evidencia_url = null;
    if (file) {
      evidencia_url = URL.createObjectURL(file); // Fake URL temporal
    }

    const newIncident: Incident = {
      ...data,
      id: `inc-${mockUUID()}`,
      estado: 'Reportado',
      fecha_reporte: new Date().toISOString(),
      evidencia_url,
      reportador_nombre: 'Usuario Actual',
      ruta_codigo: data.ruta_id ? 'R-XX' : undefined,
      bus_placa: data.bus_id ? 'XXX-000' : undefined
    };

    memoryIncidents = [newIncident, ...memoryIncidents];

    // Emitir WebSocket event para administradores
    if (isMockSocket) {
      (appSocket as any).emit(WS_EVENTS.INCIDENT_CREATED, newIncident);
    }

    return newIncident;
  },

  /**
   * Actualiza el estado de un incidente (Admin)
   */
  updateStatus: async (id: string, estado: Incident['estado']): Promise<Incident> => {
    await withDelay(null, 500);
    const index = memoryIncidents.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Incidente no encontrado');

    const updated = { ...memoryIncidents[index], estado };
    memoryIncidents[index] = updated;

    if (isMockSocket) {
      (appSocket as any).emit(WS_EVENTS.INCIDENT_UPDATED, updated);
    }

    return updated;
  }
};
