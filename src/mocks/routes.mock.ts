// ================================================================
// MOCK DATA — RUTAS
// Basado en el modelo: RUTA + RUTA_PARADERO + PARADERO
// ================================================================

export interface MockParadero {
  id: string;
  codigo: string;
  nombre: string;
  latitud: number;
  longitud: number;
  tipo: string;
  estado: boolean;
}

export interface MockRutaParadero {
  paradero: MockParadero;
  orden: number;
  distancia_desde_anterior: number; // km
  tiempo_estimado: number;          // minutos
}

export interface MockRuta {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  tarifa: number;
  tiempo_estimado_total: number; // minutos
  estado: boolean;
  paraderos: MockRutaParadero[];
}

export const MOCK_PARADEROS: MockParadero[] = [
  { id: 'p-001', codigo: 'PAR-001', nombre: 'Terminal Central',      latitud: 5.0703, longitud: -75.5138, tipo: 'Terminal', estado: true },
  { id: 'p-002', codigo: 'PAR-002', nombre: 'Parque Caldas',         latitud: 5.0683, longitud: -75.5173, tipo: 'Paradero', estado: true },
  { id: 'p-003', codigo: 'PAR-003', nombre: 'Estadio Palogrande',    latitud: 5.0651, longitud: -75.5071, tipo: 'Paradero', estado: true },
  { id: 'p-004', codigo: 'PAR-004', nombre: 'La Enea',               latitud: 5.0810, longitud: -75.4991, tipo: 'Paradero', estado: true },
  { id: 'p-005', codigo: 'PAR-005', nombre: 'Cable Aéreo',           latitud: 5.0756, longitud: -75.5285, tipo: 'Paradero', estado: true },
  { id: 'p-006', codigo: 'PAR-006', nombre: 'San Marcel',            latitud: 5.0621, longitud: -75.4968, tipo: 'Paradero', estado: true },
  { id: 'p-007', codigo: 'PAR-007', nombre: 'Chipre',                latitud: 5.0782, longitud: -75.5249, tipo: 'Terminal', estado: true },
  { id: 'p-008', codigo: 'PAR-008', nombre: 'Centro Comercial Fundadores', latitud: 5.0670, longitud: -75.5153, tipo: 'Paradero', estado: true },
  { id: 'p-009', codigo: 'PAR-009', nombre: 'Universidad de Caldas',  latitud: 5.0692, longitud: -75.5095, tipo: 'Paradero', estado: true },
  { id: 'p-010', codigo: 'PAR-010', nombre: 'Versalles',             latitud: 5.0730, longitud: -75.5014, tipo: 'Paradero', estado: true },
];

export const MOCK_RUTAS: MockRuta[] = [
  {
    id: 'r-001',
    codigo: 'R-01',
    nombre: 'Terminal - La Enea',
    descripcion: 'Conecta el Terminal Central con el barrio La Enea pasando por el centro histórico.',
    tarifa: 2800,
    tiempo_estimado_total: 35,
    estado: true,
    paraderos: [
      { paradero: MOCK_PARADEROS[0], orden: 1, distancia_desde_anterior: 0,   tiempo_estimado: 0  },
      { paradero: MOCK_PARADEROS[1], orden: 2, distancia_desde_anterior: 0.6, tiempo_estimado: 5  },
      { paradero: MOCK_PARADEROS[7], orden: 3, distancia_desde_anterior: 0.4, tiempo_estimado: 4  },
      { paradero: MOCK_PARADEROS[8], orden: 4, distancia_desde_anterior: 0.8, tiempo_estimado: 7  },
      { paradero: MOCK_PARADEROS[9], orden: 5, distancia_desde_anterior: 1.2, tiempo_estimado: 10 },
      { paradero: MOCK_PARADEROS[3], orden: 6, distancia_desde_anterior: 1.5, tiempo_estimado: 9  },
    ],
  },
  {
    id: 'r-002',
    codigo: 'R-02',
    nombre: 'Chipre - San Marcel',
    descripcion: 'Recorre desde Chipre hasta San Marcel cruzando por el Estadio.',
    tarifa: 2800,
    tiempo_estimado_total: 40,
    estado: true,
    paraderos: [
      { paradero: MOCK_PARADEROS[6], orden: 1, distancia_desde_anterior: 0,   tiempo_estimado: 0  },
      { paradero: MOCK_PARADEROS[4], orden: 2, distancia_desde_anterior: 0.7, tiempo_estimado: 6  },
      { paradero: MOCK_PARADEROS[1], orden: 3, distancia_desde_anterior: 1.1, tiempo_estimado: 9  },
      { paradero: MOCK_PARADEROS[2], orden: 4, distancia_desde_anterior: 0.9, tiempo_estimado: 8  },
      { paradero: MOCK_PARADEROS[5], orden: 5, distancia_desde_anterior: 2.1, tiempo_estimado: 17 },
    ],
  },
  {
    id: 'r-003',
    codigo: 'R-03',
    nombre: 'Cable - Estadio Circular',
    descripcion: 'Ruta circular desde el Cable Aéreo hasta el Estadio Palogrande.',
    tarifa: 2500,
    tiempo_estimado_total: 28,
    estado: true,
    paraderos: [
      { paradero: MOCK_PARADEROS[4], orden: 1, distancia_desde_anterior: 0,   tiempo_estimado: 0  },
      { paradero: MOCK_PARADEROS[6], orden: 2, distancia_desde_anterior: 0.5, tiempo_estimado: 5  },
      { paradero: MOCK_PARADEROS[1], orden: 3, distancia_desde_anterior: 1.0, tiempo_estimado: 8  },
      { paradero: MOCK_PARADEROS[8], orden: 4, distancia_desde_anterior: 0.7, tiempo_estimado: 6  },
      { paradero: MOCK_PARADEROS[2], orden: 5, distancia_desde_anterior: 0.6, tiempo_estimado: 9  },
    ],
  },
  {
    id: 'r-004',
    codigo: 'R-04',
    nombre: 'Terminal - Versalles Expreso',
    descripcion: 'Servicio expreso con pocas paradas entre Terminal y Versalles.',
    tarifa: 3200,
    tiempo_estimado_total: 22,
    estado: true,
    paraderos: [
      { paradero: MOCK_PARADEROS[0], orden: 1, distancia_desde_anterior: 0,   tiempo_estimado: 0  },
      { paradero: MOCK_PARADEROS[7], orden: 2, distancia_desde_anterior: 0.5, tiempo_estimado: 7  },
      { paradero: MOCK_PARADEROS[9], orden: 3, distancia_desde_anterior: 1.8, tiempo_estimado: 15 },
    ],
  },
  {
    id: 'r-005',
    codigo: 'R-05',
    nombre: 'Universidad - San Marcel',
    descripcion: 'Conecta la Universidad de Caldas con San Marcel pasando por el Estadio.',
    tarifa: 2600,
    tiempo_estimado_total: 30,
    estado: false, // fuera de servicio temporalmente
    paraderos: [
      { paradero: MOCK_PARADEROS[8], orden: 1, distancia_desde_anterior: 0,   tiempo_estimado: 0  },
      { paradero: MOCK_PARADEROS[2], orden: 2, distancia_desde_anterior: 0.6, tiempo_estimado: 6  },
      { paradero: MOCK_PARADEROS[1], orden: 3, distancia_desde_anterior: 0.9, tiempo_estimado: 9  },
      { paradero: MOCK_PARADEROS[5], orden: 4, distancia_desde_anterior: 1.8, tiempo_estimado: 15 },
    ],
  },
];
