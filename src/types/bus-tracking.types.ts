// TIPOS — Bus Tracking en Tiempo Real
//src/types/bus-tracking.types.ts

export const BusEstado = {
  Operativo:     'Operativo',
  Mantenimiento: 'Mantenimiento',
  FueraServicio: 'Fuera_Servicio',
} as const;
export type BusEstado = typeof BusEstado[keyof typeof BusEstado];

export const NivelRetraso = {
  EnTiempo: 'en_tiempo',  // ETA dentro del margen normal
  Leve:     'leve',       // 1–5 min de retraso
  Moderado: 'moderado',   // 5–15 min de retraso
  Critico:  'critico',    // > 15 min → alerta visual
} as const;
export type NivelRetraso = typeof NivelRetraso[keyof typeof NivelRetraso];


// ENTIDADES DE DOMINIO

/** Coordenada geográfica */
export interface Coordenada {
  lat: number;
  lng: number;
}

/** Paradero más cercano al bus */
export interface ParaderoCercano {
  id: string;
  nombre: string;
  coordenada: Coordenada;
  /** Distancia en metros desde el bus al paradero */
  distanciaMetros: number;
}

/** Posición en tiempo real de un bus en una ruta */
export interface BusPosicion {
  busId: string;
  placa: string;
  rutaId: string;
  coordenada: Coordenada;
  /** Velocidad actual en km/h */
  velocidadKmh: number;
  /** Rumbo en grados (0–360) */
  heading: number;
  paraderoCercano: ParaderoCercano;
  /** Tiempo estimado de llegada al próximo paradero (segundos) */
  etaSegundos: number;
  nivelRetraso: NivelRetraso;
  /** Porcentaje de ocupación del bus (0–100) */
  ocupacionPorcentaje: number;
  /** Timestamp del último update recibido */
  ultimaActualizacion: string; // ISO 8601
}

// PAYLOADS DE WEBSOCKET

/** Payload de WS_EVENTS.ROUTE_BUS_LOCATION_UPDATED */
export interface WsRouteBusLocationPayload {
  routeId: string;
  busId: string;
  placa: string;
  lat: number;
  lng: number;
  velocidadKmh: number;
  heading: number;
  timestamp: string;
}

/** Payload de WS_EVENTS.NEARBY_BUS_UPDATED */
export interface WsNearbyBusPayload {
  busId: string;
  paraderoId: string;
  paraderoNombre: string;
  paraderoLat: number;
  paraderoLng: number;
  distanciaMetros: number;
}

/** Payload de WS_EVENTS.STOP_ARRIVAL_ESTIMATION */
export interface WsStopArrivalPayload {
  busId: string;
  paraderoId: string;
  etaSegundos: number;
  ocupacionPorcentaje: number;
}

/** Payload de WS_EVENTS.ROUTE_DELAY_UPDATED */
export interface WsRouteDelayPayload {
  busId: string;
  routeId: string;
  nivelRetraso: NivelRetraso;
  retrasoSegundos: number;
}

// ESTADO DEL HOOK useGPSPositions

export interface GPSPositionsState {
  /** Map de busId → posición actual. O(1) lookup y update. */
  buses: Map<string, BusPosicion>;
  conectado: boolean;
  error: string | null;
  ultimaSincronizacion: string | null;
}


// PROPS DE COMPONENTES

export interface MapaBusesProps {
  rutaId: string;
  /** Umbral para alerta de retraso crítico (default: 900s = 15 min) */
  umbralRetrasoCriticoSegundos?: number;
  /** Centro inicial del mapa. Default: Manizales, Colombia */
  centroInicial?: Coordenada;
  zoomInicial?: number;
}

export interface BusMarkerProps {
  bus: BusPosicion;
  estaSeleccionado: boolean;
  onSeleccionar: (busId: string) => void;
}

export interface BusPopupProps {
  bus: BusPosicion;
}