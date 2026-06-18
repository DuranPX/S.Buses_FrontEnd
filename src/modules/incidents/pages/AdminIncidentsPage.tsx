// src/modules/incidents/pages/AdminDashboardPage.tsx
import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useDashboardBuses, type BusDashboard } from '../../schedules/hooks/useDashboardBuses';
import { IncidentCard } from '../components/IncidentCard';
import {
  MAP_CENTER,
  MAP_DEFAULT_ZOOM,
  TILE_LAYER_URL,
  TILE_LAYER_ATTRIBUTION,
} from '../../../maps/mapConfig';

// ── Ícono del marcador ──────────────────────────────────────────────────────
const createBusIcon = (tieneIncidente: boolean) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${tieneIncidente ? '#ef4444' : '#22c55e'};
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        font-size: 18px;
      ">🚌</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

// ── Componente principal ────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { buses, loading, error } = useDashboardBuses();

  const totalPasajeros = useMemo(
    () => buses.reduce((acc, b) => acc + b.pasajeros, 0),
    [buses]
  );

  const busesConIncidente = useMemo(
    () => buses.filter((b) => b.tieneIncidente),
    [buses]
  );

  const busesOcupacionMaxima = useMemo(
    () => buses.filter((b) => b.ocupacion >= 100),
    [buses]
  );

  const incidentesActivos = useMemo(
    () =>
      buses
        .filter((b) => b.incidenteActivo)
        .map((b) => b.incidenteActivo!),
    [buses]
  );

  const incidentesCriticos = useMemo(
    () => incidentesActivos.filter((i) => i.gravedad === 'Crítico'),
    [incidentesActivos]
  );

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Encabezado */}
      <div>
        <h1 style={{ margin: 0, color: '#f8fafc' }}>Panel Operacional</h1>
        <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>
          Monitoreo en tiempo real de la flota · actualización cada 30 s
        </p>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <StatCard title="Buses en sistema" value={buses.length} color="#6366f1" />
        <StatCard title="Pasajeros en tránsito" value={totalPasajeros} color="#22c55e" />
        <StatCard title="Con incidente activo" value={busesConIncidente.length} color="#ef4444" />
        <StatCard title="Ocupación máxima" value={busesOcupacionMaxima.length} color="#f59e0b" />
      </div>

      {/* Alerta ocupación máxima */}
      {busesOcupacionMaxima.length > 0 && (
        <AlertBanner color="rgba(245,158,11,0.15)" border="rgba(245,158,11,0.4)" text="#fde68a">
          🚨 {busesOcupacionMaxima.length} bus(es) con ocupación máxima:{' '}
          {busesOcupacionMaxima.map((b) => b.placa).join(', ')}
        </AlertBanner>
      )}

      {/* Alerta incidentes críticos */}
      {incidentesCriticos.length > 0 && (
        <AlertBanner color="rgba(239,68,68,0.15)" border="rgba(239,68,68,0.4)" text="#fecaca">
          ⚠️ {incidentesCriticos.length} incidente(s) crítico(s) activos.
        </AlertBanner>
      )}

      {/* Mapa */}
      <div
        style={{
          height: '500px',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_DEFAULT_ZOOM}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer url={TILE_LAYER_URL} attribution={TILE_LAYER_ATTRIBUTION} />

          {buses.map((bus) => {
            if (isNaN(bus.latitud) || isNaN(bus.longitud)) return null;
            if (bus.latitud === 0 && bus.longitud === 0) return null;

            return (
              <Marker
                key={bus.id}
                position={[bus.latitud, bus.longitud]}
                icon={createBusIcon(bus.tieneIncidente)}
              >
                <Popup>
                  <BusPopup bus={bus} />
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Lista incidentes activos */}
      <div>
        <h2 style={{ color: '#f8fafc', marginBottom: '1rem' }}>
          Incidentes Activos ({incidentesActivos.length})
        </h2>

        {loading && <p style={{ color: '#94a3b8' }}>Actualizando datos…</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        {!loading && incidentesActivos.length === 0 && (
          <p style={{ color: '#94a3b8' }}>No hay incidentes activos en este momento.</p>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '1rem',
          }}
        >
          {incidentesActivos.map((incidente) => (
            <IncidentCard key={incidente.id} incident={incidente} isAdmin />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sub-componentes ─────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '1.25rem',
      }}
    >
      <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{title}</div>
      <div
        style={{
          fontSize: '2.2rem',
          fontWeight: 700,
          color,
          marginTop: '0.4rem',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function AlertBanner({
  children,
  color,
  border,
  text,
}: {
  children: React.ReactNode;
  color: string;
  border: string;
  text: string;
}) {
  return (
    <div
      style={{
        background: color,
        border: `1px solid ${border}`,
        borderRadius: '12px',
        padding: '0.9rem 1.2rem',
        color: text,
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}

function BusPopup({ bus }: { bus: BusDashboard }) {
  return (
    <div style={{ minWidth: '200px', lineHeight: 1.6 }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>{bus.placa}</h4>
      <p style={{ margin: 0 }}>Modelo: {bus.modelo}</p>
      <p style={{ margin: 0 }}>Ruta: {bus.rutaNombre}</p>
      <p style={{ margin: 0 }}>
        Pasajeros: {bus.pasajeros} / {bus.capacidad}
      </p>
      <p style={{ margin: 0 }}>Ocupación: {bus.ocupacion.toFixed(0)}%</p>
      <p
        style={{
          margin: '0.4rem 0 0',
          fontWeight: 600,
          color: bus.tieneIncidente ? '#ef4444' : '#22c55e',
        }}
      >
        {bus.tieneIncidente
          ? `⚠️ Incidente: ${bus.incidenteActivo?.tipo}`
          : '✅ Normal'}
      </p>
    </div>
  );
}