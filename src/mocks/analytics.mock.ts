// ================================================================
// MOCK DATA — ANALÍTICAS
// Datos para los dashboards de: ingresos, rango etario, incidentes
// ================================================================

// ---- HU-014: Ingresos por método de pago ----
export interface MockIncomeDataPoint {
  mes: string;
  Tarjeta: number;
  Efectivo: number;
  ePayco: number;
}

export const MOCK_INCOME_DATA: MockIncomeDataPoint[] = [
  { mes: 'Jun 25', Tarjeta: 12400000, Efectivo: 8200000, ePayco: 1800000 },
  { mes: 'Jul 25', Tarjeta: 14100000, Efectivo: 7900000, ePayco: 2300000 },
  { mes: 'Ago 25', Tarjeta: 13800000, Efectivo: 8100000, ePayco: 2700000 },
  { mes: 'Sep 25', Tarjeta: 15200000, Efectivo: 7600000, ePayco: 3100000 },
  { mes: 'Oct 25', Tarjeta: 16500000, Efectivo: 7200000, ePayco: 3800000 },
  { mes: 'Nov 25', Tarjeta: 17100000, Efectivo: 7000000, ePayco: 4200000 },
  { mes: 'Dic 25', Tarjeta: 19800000, Efectivo: 7800000, ePayco: 5100000 },
  { mes: 'Ene 26', Tarjeta: 15600000, Efectivo: 6800000, ePayco: 4400000 },
  { mes: 'Feb 26', Tarjeta: 14900000, Efectivo: 6500000, ePayco: 4000000 },
  { mes: 'Mar 26', Tarjeta: 16200000, Efectivo: 6700000, ePayco: 4800000 },
  { mes: 'Abr 26', Tarjeta: 17800000, Efectivo: 6400000, ePayco: 5300000 },
  { mes: 'May 26', Tarjeta: 18400000, Efectivo: 6100000, ePayco: 5900000 },
];

// ---- HU-015: Rango etario ----
export interface MockAgeDataPoint {
  name: string;
  value: number;
  color: string;
}

export const MOCK_AGE_DATA: MockAgeDataPoint[] = [
  { name: '0-17 años',   value: 8,  color: '#6ee7f7' },
  { name: '18-25 años',  value: 24, color: '#818cf8' },
  { name: '26-35 años',  value: 31, color: '#34d399' },
  { name: '36-50 años',  value: 22, color: '#fbbf24' },
  { name: '51-65 años',  value: 11, color: '#f87171' },
  { name: '65+ años',    value: 4,  color: '#a78bfa' },
];

// ---- HU-016: Evolución incidentes por tipo ----
export interface MockIncidentTrendPoint {
  mes: string;
  Mecánico: number;
  Accidente: number;
  Retraso: number;
  Otro: number;
}

export const MOCK_INCIDENT_TREND: MockIncidentTrendPoint[] = [
  { mes: 'May 25', Mecánico: 4,  Accidente: 1, Retraso: 8,  Otro: 2 },
  { mes: 'Jun 25', Mecánico: 3,  Accidente: 0, Retraso: 6,  Otro: 1 },
  { mes: 'Jul 25', Mecánico: 5,  Accidente: 2, Retraso: 9,  Otro: 3 },
  { mes: 'Ago 25', Mecánico: 6,  Accidente: 1, Retraso: 11, Otro: 2 },
  { mes: 'Sep 25', Mecánico: 4,  Accidente: 0, Retraso: 7,  Otro: 1 },
  { mes: 'Oct 25', Mecánico: 7,  Accidente: 3, Retraso: 12, Otro: 4 },
  { mes: 'Nov 25', Mecánico: 5,  Accidente: 1, Retraso: 8,  Otro: 2 },
  { mes: 'Dic 25', Mecánico: 3,  Accidente: 0, Retraso: 5,  Otro: 1 },
  { mes: 'Ene 26', Mecánico: 4,  Accidente: 2, Retraso: 7,  Otro: 2 },
  { mes: 'Feb 26', Mecánico: 6,  Accidente: 1, Retraso: 9,  Otro: 3 },
  { mes: 'Mar 26', Mecánico: 5,  Accidente: 0, Retraso: 6,  Otro: 1 },
  { mes: 'Abr 26', Mecánico: 4,  Accidente: 1, Retraso: 8,  Otro: 2 },
];

// ---- Estadísticas de resumen para tarjetas ----
export const MOCK_INCOME_SUMMARY = {
  total_anual: 521600000,
  crecimiento_pct: 12.4,
  mejor_mes: 'Dic 25',
  metodo_dominante: 'Tarjeta',
};

export const MOCK_AGE_SUMMARY = {
  total_pasajeros: 48320,
  edad_promedio: 34,
  segmento_mayor: '26-35 años',
};
