
//src/modules/routes/components/RouteMap.tsx

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  MAP_CENTER,
  MAP_DEFAULT_ZOOM,
  TILE_LAYER_URL,
  TILE_LAYER_ATTRIBUTION,
  createStopIcon,
} from '../../../maps/mapConfig';
import type { RouteStop, RouteNode } from '../types/route.types';
import type { BusPosicion } from '../../../types/bus-tracking.types';
import { NivelRetraso } from '../../../types/bus-tracking.types';

// HELPERS

/** Convierte segundos en texto legible: "2 min 30 s" */
function formatEta(segundos: number): string {
  if (segundos < 60) return `${segundos} s`;
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return seg > 0 ? `${min} min ${seg} s` : `${min} min`;
}

/** Color del marcador según nivel de retraso */
function colorPorRetraso(nivel: NivelRetraso): string {
  switch (nivel) {
    case NivelRetraso.Critico:  return '#ef4444'; // rojo
    case NivelRetraso.Moderado: return '#f97316'; // naranja
    case NivelRetraso.Leve:     return '#eab308'; // amarillo
    default:                    return '#22c55e'; // verde
  }
}

/** Etiqueta de retraso legible */
function etiquetaRetraso(nivel: NivelRetraso): string {
  switch (nivel) {
    case NivelRetraso.Critico:  return '🔴 Muy retrasado';
    case NivelRetraso.Moderado: return '🟠 Retrasado';
    case NivelRetraso.Leve:     return '🟡 Leve retraso';
    default:                    return '🟢 En tiempo';
  }
}

/** Crea el ícono del bus con color dinámico según retraso */
function createBusIconColored(nivel: NivelRetraso, placa: string): L.DivIcon {
  const color = colorPorRetraso(nivel);
  const esCritico = nivel === NivelRetraso.Critico;

  return L.divIcon({
    className: '',
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      ">
        ${esCritico ? `
          <div style="
            position: absolute;
            top: -6px;
            right: -6px;
            width: 12px;
            height: 12px;
            background: #ef4444;
            border-radius: 50%;
            border: 2px solid white;
            animation: pulse 1s infinite;
            z-index: 10;
          "></div>
        ` : ''}
        <div style="
          background: ${color};
          color: white;
          border-radius: 8px;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          border: 2px solid white;
          letter-spacing: 0.5px;
        ">
          🚌 ${placa}
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
        "></div>
      </div>
    `,
    iconAnchor: [30, 42],
    popupAnchor: [0, -45],
  });
}

// SUB-COMPONENTE: auto-ajuste de bounds a los paraderos

const MapBounds = ({ stops }: { stops: RouteStop[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!stops || stops.length === 0) return;
    const L = (window as unknown as { L: typeof import('leaflet') }).L;
    if (!L) return;
    const bounds = L.latLngBounds(stops.map(s => [s.paradero.latitud, s.paradero.longitud]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, stops]);

  return null;
};

// PROPS

interface Props {
  stops: RouteStop[];
  nodes?: RouteNode[];
  /** Buses en tiempo real — provienen de useGPSPositions via useRouteSocket */
  activeBuses: BusPosicion[];
}

// COMPONENTE PRINCIPAL

export const RouteMap = ({ stops = [], nodes = [], activeBuses = [] }: Props) => {
  const pathCoordinates: [number, number][] = nodes && nodes.length > 0
    ? [...nodes]
        .sort((a, b) => (a.orden || 0) - (b.orden || 0))
        .map(n => [n.nodo.latitud, n.nodo.longitud] as [number, number])
        .filter(c => c[0] != null && c[1] != null && !isNaN(c[0]) && !isNaN(c[1]))
    : [...stops]
        .sort((a, b) => (a.orden || 0) - (b.orden || 0))
        .map(s => [s.paradero.latitud, s.paradero.longitud] as [number, number])
        .filter(c => c[0] != null && c[1] != null && !isNaN(c[0]) && !isNaN(c[1]));

  const sortedStops = [...stops].sort((a, b) => (a.orden || 0) - (b.orden || 0));

  // Alerta global si hay al menos un bus crítico
  const hayBusCritico = activeBuses.some(b => b.nivelRetraso === NivelRetraso.Critico);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>

      {/* Banner de alerta global — solo si hay un bus crítico */}
      {hayBusCritico && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(239, 68, 68, 0.95)',
          color: 'white',
          padding: '8px 20px',
          borderRadius: '999px',
          fontSize: '0.82rem',
          fontWeight: 700,
          boxShadow: '0 4px 16px rgba(239,68,68,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(8px)',
        }}>
          ⚠️ Hay buses con retraso crítico en esta ruta
        </div>
      )}

      <div style={{ height: '100%', width: '100%', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%', background: '#1e293b' }}
        >
          <TileLayer url={TILE_LAYER_URL} attribution={TILE_LAYER_ATTRIBUTION} />

          {/* Polilínea de la ruta */}
          {pathCoordinates.length > 1 && (
            <Polyline positions={pathCoordinates} color="#6366f1" weight={4} opacity={0.8} />
          )}

          {/* Marcadores de paraderos */}
          {sortedStops.map(rs => (
            <Marker
              key={rs.paradero.id}
              position={[rs.paradero.latitud, rs.paradero.longitud]}
              icon={createStopIcon(rs.orden)}
            >
              <Popup>
                <div style={{ color: '#0f172a' }}>
                  <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '4px' }}>
                    {rs.orden}. {rs.paradero.nombre}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{rs.paradero.tipo}</span>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Marcadores de buses activos con info completa */}
          {activeBuses.map(bus => (
            <Marker
              key={bus.busId}
              position={[bus.coordenada.lat, bus.coordenada.lng]}
              icon={createBusIconColored(bus.nivelRetraso, bus.placa)}
            >
              <Popup minWidth={220}>
                <div style={{ color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>

                  {/* Encabezado: placa + estado */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong style={{ fontSize: '1.1rem' }}>🚌 {bus.placa}</strong>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: colorPorRetraso(bus.nivelRetraso),
                    }}>
                      {etiquetaRetraso(bus.nivelRetraso)}
                    </span>
                  </div>

                  <hr style={{ margin: '0 0 10px', borderColor: '#e2e8f0' }} />

                  {/* Paradero más cercano */}
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Paradero más cercano
                    </span>
                    <p style={{ margin: '2px 0 0', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                      📍 {bus.paraderoCercano.nombre}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      A {bus.paraderoCercano.distanciaMetros} m
                    </p>
                  </div>

                  {/* ETA */}
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Tiempo estimado de llegada
                    </span>
                    <p style={{ margin: '2px 0 0', fontSize: '0.88rem', fontWeight: 700, color: '#6366f1' }}>
                      ⏱ {formatEta(bus.etaSegundos)}
                    </p>
                  </div>

                  {/* Ocupación */}
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Ocupación
                    </span>
                    <div style={{ marginTop: '4px', background: '#f1f5f9', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${bus.ocupacionPorcentaje}%`,
                        height: '100%',
                        background: bus.ocupacionPorcentaje > 80 ? '#ef4444' : '#6366f1',
                        borderRadius: '999px',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      {bus.ocupacionPorcentaje}% de capacidad
                    </p>
                  </div>

                </div>
              </Popup>
            </Marker>
          ))}

          <MapBounds stops={stops} />
        </MapContainer>
      </div>
    </div>
  );
};