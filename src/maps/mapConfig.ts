// ================================================================
// MAP CONFIG — Leaflet
// Configuración centralizada para todos los mapas del sistema.
// ================================================================

// Centro por defecto: Manizales, Colombia
export const MAP_CENTER: [number, number] = [5.0703, -75.5138];
export const MAP_DEFAULT_ZOOM = 14;
export const MAP_MIN_ZOOM = 11;
export const MAP_MAX_ZOOM = 19;

// Tile layer — OpenStreetMap (sin API key requerida)
export const TILE_LAYER_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_LAYER_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Tile layer oscuro (para modo dark)
export const TILE_LAYER_DARK_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
export const TILE_LAYER_DARK_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Configuración de iconos SVG inline (evita problemas de assets con Vite)
export const createStopIcon = (order?: number) => {
  const L = (window as any).L;
  if (!L) return undefined;

  const svg = order
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <ellipse cx="16" cy="38" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
        <path d="M16 0 C8 0 0 7 0 16 C0 28 16 40 16 40 C16 40 32 28 32 16 C32 7 24 0 16 0Z" fill="#6366f1"/>
        <circle cx="16" cy="16" r="10" fill="white"/>
        <text x="16" y="21" text-anchor="middle" font-size="12" font-weight="bold" fill="#6366f1">${order}</text>
      </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="35" viewBox="0 0 28 35">
        <path d="M14 0 C6 0 0 6 0 14 C0 24 14 35 14 35 C14 35 28 24 28 14 C28 6 22 0 14 0Z" fill="#10b981"/>
        <circle cx="14" cy="14" r="7" fill="white"/>
      </svg>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: order ? [32, 40] : [28, 35],
    iconAnchor: order ? [16, 40] : [14, 35],
    popupAnchor: [0, -35],
  });
};

export const createBusIcon = () => {
  const L = (window as any).L;
  if (!L) return undefined;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="17" fill="#f59e0b" stroke="white" stroke-width="2"/>
    <text x="18" y="24" text-anchor="middle" font-size="18">🚌</text>
  </svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [36, 36], iconAnchor: [18, 18] });
};

export const createUserIcon = () => {
  const L = (window as any).L;
  if (!L) return undefined;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="17" fill="#3b82f6" stroke="white" stroke-width="2"/>
    <text x="18" y="24" text-anchor="middle" font-size="18">📍</text>
  </svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [36, 36], iconAnchor: [18, 18] });
};
