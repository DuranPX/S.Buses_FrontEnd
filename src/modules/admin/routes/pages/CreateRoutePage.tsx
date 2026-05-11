import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Icono temporal
const dotIcon = L.divIcon({ className: 'custom-dot-icon', html: '<div style="width:12px;height:12px;background:#6366f1;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5);"></div>', iconSize: [12, 12], iconAnchor: [6, 6] });

const MapClicker = ({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });
  return null;
};

const CreateRoutePage = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState<L.LatLng[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSave = () => {
    if (points.length < 2) return alert('Dibuja al menos 2 puntos en el mapa');
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/admin/rutas');
    }, 1000);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem', color: '#f8fafc' }}>
            Constructor de Rutas
          </h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Haz clic en el mapa para trazar el recorrido de la nueva ruta.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setPoints([])}
            style={{ background: 'rgba(255,255,255,0.1)', color: '#f8fafc', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
          >
            Limpiar Trazo
          </button>
          <button 
            onClick={handleSave} disabled={isProcessing || points.length < 2}
            style={{ background: '#10b981', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: (isProcessing || points.length < 2) ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: (isProcessing || points.length < 2) ? 0.5 : 1 }}
          >
            {isProcessing ? 'Guardando...' : 'Guardar Ruta'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Panel Formulario */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem', overflowY: 'auto' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#f8fafc' }}>Datos Base</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Código (Ej. R-01)</label>
            <input type="text" placeholder="R-XX" style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Nombre de la Ruta</label>
            <input type="text" placeholder="Centro - Terminal" style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Tarifa Base ($)</label>
            <input type="number" defaultValue={2800} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />

          <h3 style={{ margin: '0 0 1rem', color: '#f8fafc' }}>Estadísticas del Trazo</h3>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
            Puntos Marcados: <strong>{points.length}</strong>
          </p>
        </div>

        {/* Mapa Editor */}
        <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <MapContainer 
            center={[5.06889, -75.51738]} 
            zoom={14} 
            style={{ width: '100%', height: '100%', background: '#0f172a' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <MapClicker onMapClick={(latlng) => setPoints(p => [...p, latlng])} />
            
            {points.length > 0 && (
              <Polyline positions={points.map(p => [p.lat, p.lng])} color="#6366f1" weight={4} opacity={0.8} />
            )}
            
            {points.map((p, i) => (
              <Marker key={i} position={p} icon={dotIcon} />
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default CreateRoutePage;
