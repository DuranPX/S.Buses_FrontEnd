// ================================================================
// MOCK DATA — CARTERA / HISTORIAL FINANCIERO
// Basado en: METODO_PAGO_CIUDADANO, HISTORIAL
// ================================================================

export interface MockSaldoCiudadano {
  ciudadano_id: string;
  metodo_pago_id: string;
  tipo: 'Tarjeta' | 'Efectivo' | 'ePayco';
  saldo: number;
  estado: boolean;
}

export interface MockHistorialItem {
  id: string;
  ciudadano_id: string;
  tipo: 'VIAJE' | 'RECARGA' | 'AJUSTE';
  monto: number;
  referencia_externa: string | null;
  boleto_id: string | null;
  fecha: string;
  descripcion: string;
}

// Saldo del ciudadano autenticado (mock: usuario u-001)
export const MOCK_SALDO_CIUDADANO: MockSaldoCiudadano = {
  ciudadano_id: 'u-001',
  metodo_pago_id: 'mp-001',
  tipo: 'Tarjeta',
  saldo: 42600,
  estado: true,
};

export const MOCK_HISTORIAL: MockHistorialItem[] = [
  { id: 'h-001', ciudadano_id: 'u-001', tipo: 'RECARGA', monto: 50000, referencia_externa: 'TXN-20260508-001', boleto_id: null,      fecha: '2026-05-08T05:30:00Z', descripcion: 'Recarga vía Tarjeta débito' },
  { id: 'h-002', ciudadano_id: 'u-001', tipo: 'VIAJE',   monto: -2800, referencia_externa: null,               boleto_id: 'bol-001', fecha: '2026-05-08T06:05:00Z', descripcion: 'Viaje Terminal - La Enea'   },
  { id: 'h-003', ciudadano_id: 'u-001', tipo: 'VIAJE',   monto: -3200, referencia_externa: null,               boleto_id: 'bol-002', fecha: '2026-05-07T18:04:00Z', descripcion: 'Viaje Terminal - Versalles' },
  { id: 'h-004', ciudadano_id: 'u-001', tipo: 'RECARGA', monto: 30000, referencia_externa: 'TXN-20260501-009', boleto_id: null,      fecha: '2026-05-01T09:00:00Z', descripcion: 'Recarga vía ePayco'        },
  { id: 'h-005', ciudadano_id: 'u-001', tipo: 'VIAJE',   monto: -2800, referencia_externa: null,               boleto_id: null,      fecha: '2026-04-30T07:45:00Z', descripcion: 'Viaje Chipre - San Marcel' },
  { id: 'h-006', ciudadano_id: 'u-001', tipo: 'AJUSTE',  monto: 1400,  referencia_externa: 'ADJ-20260420',     boleto_id: null,      fecha: '2026-04-20T14:00:00Z', descripcion: 'Ajuste por cobro incorrecto' },
];

// Montos rápidos de recarga disponibles
export const MOCK_MONTOS_RAPIDOS = [5000, 10000, 20000, 30000, 50000];
