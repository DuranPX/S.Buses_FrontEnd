import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { stopsService } from '../../../stops/services/stopsService';
import { nodesService } from '../../../stops/services/nodesService';

const stopIcon = L.divIcon({
  className: 'custom-stop-icon',
  html: '<div style="width:16px;height:16px;background:#10b981;border-radius:50%;border:2px solid white;box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const MapClicker = ({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) => {
  useMapEvents({ click(e) { onMapClick(e.latlng); } });
  return null;
};

const LeafletResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => { map.invalidateSize(); }, 100);
  }, [map]);
  return null;
};

const CreateStopPage = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo: 'Intermedio',
    estado: true
  });

  const handleSave = async () => {
    if (!position) return alert('Selecciona una ubicación en el mapa');
    if (!formData.codigo || !formData.nombre) return alert('Código y Nombre son obligatorios');

    setIsSaving(true);
    try {
      // 1. Crear el Nodo
      const node = await nodesService.create({
        latitud: position.lat,
        longitud: position.lng
      });

      // 2. Crear el Paradero vinculado al Nodo
      await stopsService.create({
        ...formData,
        latitud: position.lat,
        longitud: position.lng,
        nodo_id: node.id
      });

      navigate('/admin/paraderos');
    } catch (e) {
      alert('Error al crear el paradero. Quiza ya existe un paradero con el mismo código.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>Nuevo Paradero</h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>Define la ubicación y datos del nuevo punto de parada.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button onClick={() => navigate('/admin/paraderos')} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>Cancelar</button>
          <button
            onClick={handleSave} disabled={isSaving || !position}
            style={{ background: '#10b981', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: (isSaving || !position) ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: (isSaving || !position) ? 0.5 : 1 }}
          >
            {isSaving ? 'Guardando...' : 'Crear Paradero'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Código (Ej. PAR-001)</label>
            <input type="text" value={formData.codigo} onChange={e => setFormData({ ...formData, codigo: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Nombre</label>
            <input type="text" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Tipo</label>
            <select value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              <option value="Intermedio">Intermedio</option>
              <option value="Principal">Principal</option>
              <option value="Terminal">Terminal</option>
            </select>
          </div>
          {position && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(99,102,241,0.1)', borderRadius: '0.5rem', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '0.2rem' }}>Ubicación Seleccionada:</div>
              <div style={{ fontSize: '0.85rem', color: 'white' }}>{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</div>
            </div>
          )}
        </div>

        <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <MapContainer center={[5.06889, -75.51738]} zoom={14} style={{ width: '100%', height: '100%', background: '#0f172a' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
            <LeafletResizeHandler />
            <MapClicker onMapClick={setPosition} />
            {position && <Marker position={position} icon={stopIcon} />}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default CreateStopPage;
