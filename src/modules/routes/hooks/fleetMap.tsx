import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from 'react-leaflet';

import {
  MAP_CENTER,
  MAP_DEFAULT_ZOOM,
  TILE_LAYER_URL,
  TILE_LAYER_ATTRIBUTION
} from '../../../maps/mapConfig';

import L from 'leaflet';

interface FleetBus {
  id: string;
  placa: string;
  lat: number;
  lng: number;
  estado: 'normal' | 'incidente';
  pasajeros: number;
}

function createFleetBusIcon(
  estado: 'normal' | 'incidente'
) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        background:${estado === 'normal'
          ? '#22c55e'
          : '#ef4444'};
        border-radius:50%;
        width:36px;
        height:36px;
        display:flex;
        align-items:center;
        justify-content:center;
        border:2px solid white;
      ">
        🚌
      </div>
    `,
    iconSize:[36,36],
    iconAnchor:[18,18]
  });
}

export const FleetMap = ({
  buses
}: {
  buses: FleetBus[]
}) => {

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_DEFAULT_ZOOM}
      style={{
        width:'100%',
        height:'500px'
      }}
    >
      <TileLayer
        url={TILE_LAYER_URL}
        attribution={TILE_LAYER_ATTRIBUTION}
      />

      {buses.map(bus => (
        <Marker
          key={bus.id}
          position={[bus.lat, bus.lng]}
          icon={createFleetBusIcon(bus.estado)}
        >
          <Popup>
            <strong>{bus.placa}</strong>

            <br/>

            Estado:

            {bus.estado === 'normal'
              ? ' 🟢 Normal'
              : ' 🔴 Incidente'}

            <br/>

            Pasajeros:
            {' '}
            {bus.pasajeros}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};