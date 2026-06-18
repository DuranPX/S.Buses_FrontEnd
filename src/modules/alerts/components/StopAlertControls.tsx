// src/modules/alerts/components/StopAlertControls.tsx
//
// Encapsula la UI de activar/desactivar una alerta de paradero específica.
// El estado real (si está activa, si ya se disparó) viene de
// StopAlertsProvider a través de useStopAlerts; este componente solo
// maneja estado efímero de UI (isSubscribing mientras espera respuesta,
// y el permiso de notificaciones).

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStopAlerts } from '../hooks/useStopAlerts';
import { ANTICIPACIONES_MIN, type AnticipacionMin } from '../types/alert.types';
import {
  getNotificationPermission,
  requestNotificationPermission,
} from '../../../notifications/pushNotifications';

interface Props {
  routeId: string;
  rutaNombre: string;
  stopId: string;
  paraderoNombre: string;
  anticipationMin: AnticipacionMin;
  onAnticipationChange: (min: AnticipacionMin) => void;
}

export const StopAlertControls = ({
  routeId,
  rutaNombre,
  stopId,
  paraderoNombre,
  anticipationMin,
  onAnticipationChange,
}: Props) => {
  const navigate = useNavigate();

  const { alertaActiva, error, ultimaAlertaDisparada, activarAlerta, desactivarAlerta } =
    useStopAlerts(routeId, stopId, { rutaNombre, paraderoNombre });

  const [isSubscribing, setIsSubscribing] = useState(false); 
  const [permisoNotificaciones, setPermisoNotificaciones] = useState <
    NotificationPermission | 'unsupported'
  >(getNotificationPermission());

  const handleActivar = async () => {
    setIsSubscribing(true);

    // Gesto explícito del usuario: buen momento para pedir el permiso de
    // notificaciones (varios navegadores ignoran el prompt si no viene de
    // una interacción directa como esta).
    if (getNotificationPermission() !== 'unsupported') {
      const permiso = await requestNotificationPermission();
      setPermisoNotificaciones(permiso);
    }

    try {
      await activarAlerta({ routeId, stopId, anticipationMin });
    } catch {
      // El error ya queda reflejado en `error` (viene de StopAlertsProvider).
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <>
      {alertaActiva ? (
        <div>
          <div
            style={{
              background: 'rgba(52,211,153,0.1)',
              border: '1px solid rgba(52,211,153,0.3)',
              borderRadius: '0.75rem',
              padding: '0.85rem',
              marginBottom: '0.85rem',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>
              ✅ Alerta activa
            </p>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#cbd5e1' }}>
              Te avisaremos cuando el bus esté a {alertaActiva.anticipation_min} min de{' '}
              <strong>{alertaActiva.paraderoNombre}</strong>.
            </p>
          </div>

          <button
            onClick={desactivarAlerta}
            style={{
              width: '100%',
              background: 'rgba(239,68,68,0.12)',
              color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '0.6rem',
              padding: '0.65rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Desactivar alerta
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                color: '#94a3b8',
                marginBottom: '0.35rem',
              }}
            >
              Anticipación
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {ANTICIPACIONES_MIN.map((min) => (
                <button
                  key={min}
                  onClick={() => onAnticipationChange(min)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0',
                    borderRadius: '0.5rem',
                    border: `1px solid ${anticipationMin === min ? '#6366f1' : 'rgba(255,255,255,0.12)'}`,
                    background: anticipationMin === min ? 'rgba(99,102,241,0.18)' : 'transparent',
                    color: anticipationMin === min ? '#a5b4fc' : '#cbd5e1',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {min} min
                </button>
              ))}
            </div>
          </div>

          {permisoNotificaciones === 'denied' && (
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#f59e0b' }}>
              ⚠️ Bloqueaste las notificaciones del navegador. La alerta seguirá
              activándose dentro de la app, pero no como notificación del sistema.
            </p>
          )}

          {error && <p style={{ margin: 0, fontSize: '0.8rem', color: '#ef4444' }}>{error}</p>}

          <button
            onClick={handleActivar}
            disabled={isSubscribing}
            style={{
              width: '100%',
              background: isSubscribing ? 'rgba(99,102,241,0.4)' : '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '0.6rem',
              padding: '0.65rem',
              fontWeight: 600,
              cursor: isSubscribing ? 'default' : 'pointer',
            }}
          >
            {isSubscribing ? 'Activando…' : 'Activar alerta'}
          </button>
        </div>
      )}

      {ultimaAlertaDisparada && (
        <div
          style={{
            marginTop: '0.85rem',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '0.75rem',
            padding: '0.85rem',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>
            {ultimaAlertaDisparada.title}
          </p>
          <p style={{ margin: '0.35rem 0 0.65rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
            {ultimaAlertaDisparada.body}
          </p>
          <button
            onClick={() => navigate('/cartera/recarga')}
            style={{
              background: '#34d399',
              color: '#0f172a',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.45rem 0.8rem',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            💳 Preparar método de pago
          </button>
        </div>
      )}
    </>
  );
};