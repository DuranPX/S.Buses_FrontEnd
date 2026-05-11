// ================================================================
// TIPOS — Módulo Incidentes (HU-007, HU-008)
// ================================================================

export interface Incident {
  id: string;
  reportador_id: string; // ciudadano o conductor
  bus_id: string | null;
  ruta_id: string | null;
  tipo: 'Accidente' | 'Falla_Mecanica' | 'Comportamiento' | 'Retraso' | 'Otro';
  descripcion: string;
  latitud: number | null;
  longitud: number | null;
  estado: 'Reportado' | 'En_Revision' | 'Resuelto';
  evidencia_url: string | null; // URL de la foto subida
  fecha_reporte: string;
  
  // Expandidos para UI
  reportador_nombre?: string;
  ruta_codigo?: string;
  bus_placa?: string;
}
