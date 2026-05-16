import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // CRITICO: Sin esto el mapa sale fragmentado
import { routesService } from '../../../routes/services/routesService';
import type { CreateRutaFullDto } from '../../../routes/services/routesService';
import { stopsService } from '../../../../modules/stops/services/stopsService';
import type { Stop } from '../../../../modules/stops/types/stop.types';
import { nodesService } from '../../../../modules/stops/services/nodesService';
import { Loader } from '../../../../shared/components/ui/Loader';

// Icono para puntos de trazo (nodos)
const dotIcon = L.divIcon({ 
  className: 'custom-dot-icon', 
  html: '<div style="width:10px;height:10px;background:#6366f1;border-radius:50%;border:1px solid white;"></div>', 
  iconSize: [10, 10], 
  iconAnchor: [5, 5] 
});

// Icono para paraderos (Asegurar que sea visible)
const stopIcon = L.divIcon({ 
  className: 'custom-stop-icon', 
  html: '<div style="width:14px;height:14px;background:#10b981;border-radius:50%;border:2px solid white;box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>', 
  iconSize: [14, 14], 
  iconAnchor: [7, 7] 
});

const MapClicker = ({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) => {
  useMapEvents({ click(e) { onMapClick(e.latlng); } });
  return null;
};

// Componente para corregir el fragmentado del mapa al cargar
const LeafletResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Radio de la Tierra en metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
};

const CreateRoutePage = () => {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<L.LatLng[]>([]);
  const [allStops, setAllStops] = useState<Stop[]>([]);
  const [selectedStopIds, setSelectedStopIds] = useState<string[]>([]);
  const [isLoadingStops, setIsLoadingStops] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    tarifa: 2800,
    tiempo_estimado_total: 45
  });

  useEffect(() => {
    stopsService.getAll()
      .then(setAllStops)
      .finally(() => setIsLoadingStops(false));
  }, []);

  const handleSave = async () => {
    if (!formData.nombre) return alert('El Nombre de la ruta es obligatorio');
    if (selectedStopIds.length < 3) return alert('Debes seleccionar al menos 3 paraderos (Origen, Intermedio y Destino)');

    setIsSaving(true);
    try {
      // 1. Persistir los Nodos de geometría primero
      const createdNodes = await Promise.all(
        nodes.map(n => nodesService.create({ latitud: n.lat, longitud: n.lng }))
      );

      // 2. Preparar el DTO de paraderos con cálculo de distancia/tiempo
      const paraderosDto = selectedStopIds.map((id, index) => {
        const currentStop = allStops.find(s => s.id === id);
        const prevStopId = index > 0 ? selectedStopIds[index - 1] : null;
        const prevStop = allStops.find(s => s.id === prevStopId);

        let distance = 0;
        let time = 0;

        if (prevStop && currentStop) {
          distance = calculateDistance(
            prevStop.latitud, prevStop.longitud, 
            currentStop.latitud, currentStop.longitud
          );
          time = Math.round(distance / 300) + 1;
        }

        return {
          paraderoId: id,
          distanciaAnterior: Math.round(distance),
          tiempoEstimadoMins: time
        };
      });

      // 3. Payload final con geometría
      const dto: CreateRutaFullDto = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        tarifa: formData.tarifa,
        paraderos: paraderosDto,
        nodos: createdNodes.map(node => ({ nodoId: node.id }))
      };

      await routesService.createFull(dto);
      navigate('/admin/rutas');
    } catch (e) {
      alert('Error al crear la ruta. Revisa que los paraderos y nodos sean válidos.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStop = (id: string) => {
    setSelectedStopIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem', color: '#f8fafc' }}>
            Constructor de Rutas
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
            Configura los datos y selecciona los paraderos en el mapa o lista.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button onClick={() => navigate('/admin/rutas')} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '0.9rem' }}>Cancelar</button>
          <button 
            onClick={handleSave} disabled={isSaving}
            style={{ background: '#10b981', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9rem', opacity: isSaving ? 0.5 : 1, boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}
          >
            {isSaving ? 'Guardando...' : 'Guardar Ruta'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Panel Izquierdo: Formulario + Paraderos */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', backdropFilter: 'blur(10px)' }}>
          <section>
            <h3 style={{ margin: '0 0 0.8rem', color: '#f8fafc', fontSize: '0.95rem', opacity: 0.8 }}>1. Datos Generales</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <input type="text" placeholder="Nombre de la ruta" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }} />
              <input type="text" placeholder="Descripción opcional" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }} />
              <input type="number" placeholder="Tarifa ($)" value={formData.tarifa} onChange={e => setFormData({...formData, tarifa: Number(e.target.value)})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }} />
            </div>
          </section>

          <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <h3 style={{ margin: '0 0 1rem', color: '#f8fafc', fontSize: '1rem' }}>2. Paraderos Asociados ({selectedStopIds.length})</h3>
            <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', padding: '0.5rem' }}>
              {isLoadingStops ? <Loader /> : allStops.map(stop => (
                <div 
                  key={stop.id} 
                  onClick={() => toggleStop(stop.id)}
                  style={{ padding: '0.6rem', borderRadius: '0.4rem', marginBottom: '0.4rem', cursor: 'pointer', background: selectedStopIds.includes(stop.id) ? 'rgba(16,185,129,0.2)' : 'transparent', border: `1px solid ${selectedStopIds.includes(stop.id) ? '#10b981' : 'rgba(255,255,255,0.05)'}`, transition: 'all 0.2s' }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{stop.nombre}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{stop.codigo}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Panel Derecho: Mapa */}
        <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', background: '#0f172a' }}>
          <MapContainer 
            center={[5.06889, -75.51738]} 
            zoom={14} 
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
              attribution='&copy; OpenStreetMap' 
            />
            <LeafletResizeHandler />
            <MapClicker onMapClick={(latlng) => setNodes(p => [...p, latlng])} />
            
            {/* Trazo de Nodos */}
            <Polyline positions={nodes.map(n => [n.lat, n.lng])} color="#6366f1" weight={3} opacity={0.6} />
            {nodes.map((n, i) => <Marker key={`node-${i}`} position={n} icon={dotIcon} />)}

            {/* Paraderos */}
            {allStops.map(stop => (
              <Marker 
                key={stop.id} 
                position={[stop.latitud, stop.longitud]} 
                icon={stopIcon}
                eventHandlers={{ click: () => toggleStop(stop.id) }}
              >
                <Popup>
                  <div style={{ color: '#000' }}>
                    <strong>{stop.nombre}</strong><br/>
                    Código: {stop.codigo}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default CreateRoutePage;
