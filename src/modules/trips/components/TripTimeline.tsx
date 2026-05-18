// src/modules/trips/components/TripTimeline.tsx
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { Trip } from '../types/trip.types';

interface Props {
  trip: Trip;
}

const abordajeIcon = L.divIcon({
  className: '',
  html: '<div style="width:16px;height:16px;background:#10b981;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.5);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const descensoIcon = L.divIcon({
  className: '',
  html: '<div style="width:16px;height:16px;background:#f59e0b;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.5);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export const TripTimeline = ({ trip }: Props) => {
  const tAbordaje = new Date(trip.fecha_abordaje).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const tDescenso = new Date(trip.fecha_descenso).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const tieneUbicaciones = trip.paraderoAbordaje && trip.paraderoDescenso;
  const centerLat = tieneUbicaciones
    ? (trip.paraderoAbordaje!.latitud + trip.paraderoDescenso!.latitud) / 2
    : 5.06889;
  const centerLng = tieneUbicaciones
    ? (trip.paraderoAbordaje!.longitud + trip.paraderoDescenso!.longitud) / 2
    : -75.51738;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Mapa ── */}
      {tieneUbicaciones && (
        <div style={{ borderRadius: '0.75rem', overflow: 'hidden', height: '280px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={14}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

            <Marker
              position={[trip.paraderoAbordaje!.latitud, trip.paraderoAbordaje!.longitud]}
              icon={abordajeIcon}
            />
            <Marker
              position={[trip.paraderoDescenso!.latitud, trip.paraderoDescenso!.longitud]}
              icon={descensoIcon}
            />
            <Polyline
              positions={[
                [trip.paraderoAbordaje!.latitud, trip.paraderoAbordaje!.longitud],
                [trip.paraderoDescenso!.latitud, trip.paraderoDescenso!.longitud],
              ]}
              color="#6366f1"
              weight={3}
              dashArray="8 4"
            />
          </MapContainer>
        </div>
      )}

      {/* ── Timeline ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Abordaje */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#10b981', border: '3px solid rgba(16,185,129,0.3)' }} />
            <div style={{ width: '2px', height: '50px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
          </div>
          <div style={{ flex: 1, paddingBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>{trip.origen_nombre}</h4>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
                {tAbordaje}
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Abordaje</p>
          </div>
        </div>

        {/* Info en ruta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '2rem', paddingBottom: '1.5rem' }}>
          <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px dashed rgba(255,255,255,0.1)', flex: 1, display: 'flex', justifyContent: 'space-around', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span>⏱ {trip.duracion_minutos} min</span>
            {trip.distancia_km && <span>📏 {trip.distancia_km} km</span>}
          </div>
        </div>

        {/* Descenso */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#f59e0b', border: '3px solid rgba(245,158,11,0.3)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>{trip.destino_nombre}</h4>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
                {tDescenso}
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Descenso y Fin del viaje</p>
          </div>
        </div>
      </div>

      {/* ── Bus y Conductor ── */}
      {(trip.bus || trip.conductor) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          {trip.bus && (
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🚌 Bus</span>
              <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: '#f8fafc' }}>{trip.bus.placa}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{trip.bus.modelo}</p>
            </div>
          )}
          {trip.conductor && (
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>👤 Conductor</span>
              <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: '#f8fafc' }}>{trip.conductor.nombre}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Lic: {trip.conductor.licencia}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};