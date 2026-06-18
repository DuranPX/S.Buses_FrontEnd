// src/modules/alerts/components/StopAlertPanel.tsx
//
// Panel UI para la HU "Aviso de bus a X minutos":
//   - selecciona el paradero (dentro de la ruta ya elegida)
//   - selecciona la anticipación (5 / 10 / 15 min)
//   - activa / desactiva la alerta
//   - muestra el estado (suscrito, último aviso disparado, errores)
//
// Pensado para insertarse en RouteDetailPage, donde la ruta ya viene cargada.
//
// El estado de la suscripción en sí (useStopAlerts) vive en StopAlertControls,
// montado con key={stopId}: así, al cambiar de paradero seleccionado, React
// desmonta/monta de nuevo ese subárbol y el estado no se arrastra entre
// paraderos distintos sin necesidad de resetearlo manualmente.

import { useMemo, useState } from 'react';
import type { RouteStop } from '../../routes/types/route.types';
import { StopAlertControls } from './StopAlertControls';
import type { AnticipacionMin } from '../types/alert.types';

interface Props {
  routeId: string;
  rutaNombre: string;
  paraderos: RouteStop[];
}

export const StopAlertPanel = ({ routeId, rutaNombre, paraderos }: Props) => {
  const paraderosOrdenados = useMemo(
    () => [...paraderos].sort((a, b) => a.orden - b.orden),
    [paraderos],
  );

  const [stopId, setStopId] = useState<string>(paraderosOrdenados[0]?.paradero.id ?? '');
  const [anticipationMin, setAnticipationMin] = useState<AnticipacionMin>(5);

  const paraderoSeleccionado = paraderosOrdenados.find((p) => p.paradero.id === stopId);

  if (paraderosOrdenados.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '1rem',
        padding: '1.25rem',
      }}
    >
      <h4
        style={{
          margin: '0 0 1rem',
          fontSize: '0.95rem',
          fontWeight: 600,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        🔔 Avísame cuando el bus se acerque
      </h4>

      <div style={{ marginBottom: '0.85rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.78rem',
            color: '#94a3b8',
            marginBottom: '0.35rem',
          }}
        >
          Paradero
        </label>
        <select
          value={stopId}
          onChange={(e) => setStopId(e.target.value)}
          style={{
            width: '100%',
            background: '#1e293b',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '0.5rem',
            padding: '0.55rem 0.6rem',
            fontSize: '0.85rem',
          }}
        >
          {paraderosOrdenados.map((p) => (
            <option key={p.paradero.id} value={p.paradero.id}>
              {p.orden}. {p.paradero.nombre}
            </option>
          ))}
        </select>
      </div>

      {stopId && paraderoSeleccionado && (
        <StopAlertControls
          key={stopId}
          routeId={routeId}
          rutaNombre={rutaNombre}
          stopId={stopId}
          paraderoNombre={paraderoSeleccionado.paradero.nombre}
          anticipationMin={anticipationMin}
          onAnticipationChange={setAnticipationMin}
        />
      )}
    </div>
  );
};