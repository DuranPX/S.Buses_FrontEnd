import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const defaultIcon = L.divIcon({ className: 'custom-dot-icon', html: '<div style="width:16px;height:16px;background:#10b981;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5);"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });

const MapClicker = ({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });
  return null;
};

const CreateStopPage = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSave = () => {
    if (!position) return alert('Haz clic en el mapa para ubicar el paradero');
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate(-1); // Volver
    }, 1000);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem', color: '#f8fafc' }}>
            Nuevo Paradero
          </h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Establece la ubicación y detalles del nuevo paradero.
          </p>
        </div>
        <button 
          onClick={handleSave} disabled={isProcessing || !position}
          style={{ background: '#10b981', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: (isProcessing || !position) ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: (isProcessing || !position) ? 0.5 : 1 }}
        >
          {isProcessing ? 'Guardando...' : 'Guardar Paradero'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Panel Formulario */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem', overflowY: 'auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Nombre del Paradero</label>
            <input type="text" placeholder="Ej. Calle 62 con Cra 23" style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Coordenadas (Haz clic en el mapa)</label>
            <input 
              type="text" 
              readOnly 
              value={position ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` : 'No definido'} 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8' }} 
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Capacidad Max. de Personas</label>
            <input type="number" defaultValue={20} style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>
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
            />
            <MapClicker onMapClick={setPosition} />
            {position && <Marker position={position} icon={defaultIcon} />}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default CreateStopPage;
