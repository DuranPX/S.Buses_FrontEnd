// ================================================================
// MOCK DATA — BUSES + CONDUCTORES + EMPRESA
// Basado en el modelo: BUS, CONDUCTOR, PERSONA, EMPRESA
// ================================================================

export interface MockEmpresa {
  id: string;
  nombre: string;
  nit: string;
}

export interface MockBus {
  id: string;
  placa: string;
  modelo: string;
  anio: number;
  capacidad_total: number;
  capacidad_sentados: number;
  capacidad_parados: number;
  estado: 'Operativo' | 'Mantenimiento' | 'Fuera_Servicio';
  empresa_id: string;
  foto_url: string;
  qr_code: string;
}

export interface MockConductor {
  id: string;        // FK Persona
  auth_id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  numero_documento: string;
  tipo_documento: 'CC' | 'CE' | 'PAS';
  licencia: string;
  empresa_id: string;
  estado: 'Activo' | 'Inactivo';
}

export const MOCK_EMPRESAS: MockEmpresa[] = [
  { id: 'emp-001', nombre: 'Transportes Manizales S.A.S', nit: '901234567-1' },
  { id: 'emp-002', nombre: 'Ciudad Bus Ltda',             nit: '800987654-2' },
];

export const MOCK_BUSES: MockBus[] = [
  { id: 'b-001', placa: 'ABC-123', modelo: 'Mercedes Benz OF-1721', anio: 2020, capacidad_total: 50, capacidad_sentados: 35, capacidad_parados: 15, estado: 'Operativo',        empresa_id: 'emp-001', foto_url: '', qr_code: 'QR-ABC123' },
  { id: 'b-002', placa: 'DEF-456', modelo: 'Volkswagen 17.230',     anio: 2019, capacidad_total: 45, capacidad_sentados: 30, capacidad_parados: 15, estado: 'Operativo',        empresa_id: 'emp-001', foto_url: '', qr_code: 'QR-DEF456' },
  { id: 'b-003', placa: 'GHI-789', modelo: 'Chevrolet NHR',         anio: 2021, capacidad_total: 28, capacidad_sentados: 20, capacidad_parados: 8,  estado: 'Mantenimiento',   empresa_id: 'emp-002', foto_url: '', qr_code: 'QR-GHI789' },
  { id: 'b-004', placa: 'JKL-012', modelo: 'Hino AK8J',             anio: 2022, capacidad_total: 55, capacidad_sentados: 40, capacidad_parados: 15, estado: 'Operativo',        empresa_id: 'emp-002', foto_url: '', qr_code: 'QR-JKL012' },
  { id: 'b-005', placa: 'MNO-345', modelo: 'Mercedes Benz OF-1722', anio: 2018, capacidad_total: 50, capacidad_sentados: 35, capacidad_parados: 15, estado: 'Fuera_Servicio',  empresa_id: 'emp-001', foto_url: '', qr_code: 'QR-MNO345' },
  { id: 'b-006', placa: 'PQR-678', modelo: 'Volkswagen 9.150',      anio: 2023, capacidad_total: 35, capacidad_sentados: 25, capacidad_parados: 10, estado: 'Operativo',        empresa_id: 'emp-001', foto_url: '', qr_code: 'QR-PQR678' },
];

export const MOCK_CONDUCTORES: MockConductor[] = [
  { id: 'c-001', auth_id: 'auth-c01', nombre: 'Carlos',   apellido: 'Ramírez',   email: 'carlos.ramirez@buses.co',   telefono: '3101234567', numero_documento: '10234567', tipo_documento: 'CC', licencia: 'LIC-C1-001', empresa_id: 'emp-001', estado: 'Activo'   },
  { id: 'c-002', auth_id: 'auth-c02', nombre: 'Alejandro',apellido: 'Torres',    email: 'a.torres@buses.co',         telefono: '3157654321', numero_documento: '10345678', tipo_documento: 'CC', licencia: 'LIC-C2-002', empresa_id: 'emp-001', estado: 'Activo'   },
  { id: 'c-003', auth_id: 'auth-c03', nombre: 'Luisa',    apellido: 'González',  email: 'luisa.g@buses.co',          telefono: '3209876543', numero_documento: '52456789', tipo_documento: 'CC', licencia: 'LIC-C1-003', empresa_id: 'emp-002', estado: 'Activo'   },
  { id: 'c-004', auth_id: 'auth-c04', nombre: 'Mauricio', apellido: 'Herrera',   email: 'm.herrera@buses.co',        telefono: '3001122334', numero_documento: '71567890', tipo_documento: 'CC', licencia: 'LIC-C2-004', empresa_id: 'emp-002', estado: 'Inactivo' },
  { id: 'c-005', auth_id: 'auth-c05', nombre: 'Patricia', apellido: 'Moreno',    email: 'p.moreno@buses.co',         telefono: '3134455667', numero_documento: '43678901', tipo_documento: 'CC', licencia: 'LIC-C1-005', empresa_id: 'emp-001', estado: 'Activo'   },
];
