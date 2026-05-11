// ================================================================
// MOCK DATA — INCIDENTES + FOTOS
// Basado en: INCIDENTE, FOTO
// ================================================================

export interface MockFoto {
  id: string;
  incidente_id: string;
  url: string;
}

export interface MockIncidente {
  id: string;
  tipo: 'Mecánico' | 'Accidente' | 'Retraso' | 'Otro';
  gravedad: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  descripcion: string;
  seguimiento_log: string;
  estado: 'Pendiente' | 'En_Revision' | 'Resuelto';
  turno_id: string;
  bus_id: string;
  conductor_id: string;
  latitud: number;
  longitud: number;
  fecha_reporte: string;
  fotos?: MockFoto[];
  // expandidos para UI
  bus_placa?: string;
  conductor_nombre?: string;
}

export const MOCK_INCIDENTES: MockIncidente[] = [
  {
    id: 'inc-001', tipo: 'Mecánico',  gravedad: 'Alto',    descripcion: 'Falla en sistema de frenos. Bus detenido de forma preventiva en vía.',  seguimiento_log: 'Reportado por conductor. Técnico en camino.', estado: 'En_Revision', turno_id: 't-001', bus_id: 'b-001', conductor_id: 'c-001', latitud: 5.0703, longitud: -75.5138, fecha_reporte: '2026-05-08T07:32:00Z', bus_placa: 'ABC-123', conductor_nombre: 'Carlos Ramírez',
    fotos: [
      { id: 'f-001', incidente_id: 'inc-001', url: 'https://placehold.co/400x300?text=Frenos' },
    ],
  },
  {
    id: 'inc-002', tipo: 'Retraso',   gravedad: 'Bajo',    descripcion: 'Tráfico en el centro por cierre de vía. Retraso estimado 15 minutos.', seguimiento_log: 'Monitoreado en tiempo real.',                  estado: 'Resuelto',    turno_id: 't-002', bus_id: 'b-002', conductor_id: 'c-002', latitud: 5.0683, longitud: -75.5173, fecha_reporte: '2026-05-08T06:45:00Z', bus_placa: 'DEF-456', conductor_nombre: 'Alejandro Torres', fotos: [],
  },
  {
    id: 'inc-003', tipo: 'Accidente', gravedad: 'Crítico', descripcion: 'Colisión leve con motocicleta en intersección. Sin heridos graves.',     seguimiento_log: 'Policía de tránsito en escena.',              estado: 'En_Revision', turno_id: 't-004', bus_id: 'b-001', conductor_id: 'c-001', latitud: 5.0670, longitud: -75.5153, fecha_reporte: '2026-05-07T16:10:00Z', bus_placa: 'ABC-123', conductor_nombre: 'Carlos Ramírez',
    fotos: [
      { id: 'f-002', incidente_id: 'inc-003', url: 'https://placehold.co/400x300?text=Accidente+1' },
      { id: 'f-003', incidente_id: 'inc-003', url: 'https://placehold.co/400x300?text=Accidente+2' },
    ],
  },
  {
    id: 'inc-004', tipo: 'Mecánico',  gravedad: 'Medio',   descripcion: 'Puerta trasera con problemas de cierre. Operando con precaución.',      seguimiento_log: 'Programado mantenimiento para fin de turno.', estado: 'Pendiente',   turno_id: 't-002', bus_id: 'b-002', conductor_id: 'c-002', latitud: 5.0756, longitud: -75.5285, fecha_reporte: '2026-05-07T11:00:00Z', bus_placa: 'DEF-456', conductor_nombre: 'Alejandro Torres', fotos: [],
  },
  {
    id: 'inc-005', tipo: 'Otro',      gravedad: 'Bajo',    descripcion: 'Pasajero dejó objeto olvidado. Entregado a objetos perdidos.',           seguimiento_log: 'Cerrado sin novedad.',                         estado: 'Resuelto',    turno_id: 't-001', bus_id: 'b-001', conductor_id: 'c-001', latitud: 5.0651, longitud: -75.5071, fecha_reporte: '2026-05-06T09:20:00Z', bus_placa: 'ABC-123', conductor_nombre: 'Carlos Ramírez',   fotos: [],
  },
];
