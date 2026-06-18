// src/modules/messages/components/ReceivedMessages.tsx
//
// Bandeja de mensajes recibidos EN VIVO (no es un historial completo desde
// la base de datos — no existe ese endpoint, y no se necesita para esta
// tarea). Mientras este componente está montado y visible, cada mensaje
// que llega por 'private_message_received' se marca como leído de
// inmediato (emitiendo 'mark_message_read'), que es justo la semántica
// que decidimos: "leído" significa que el destinatario tenía la bandeja
// de mensajes abierta cuando llegó, no solo que el socket estaba conectado.

import { useState } from 'react';
import { useSocket } from '../../../websocket/hooks/useSocket';
import { useSocketContext } from '../../../websocket/providers/SocketProvider';
import { WS_EVENTS } from '../../../websocket/events';
import type { PrivateMessageReceivedPayload } from '../types/message';

interface RecibidoEnVivo extends PrivateMessageReceivedPayload {
  recibidoEn: string;
}

export default function ReceivedMessages() {
  const socket = useSocketContext();
  const [recibidos, setRecibidos] = useState<RecibidoEnVivo[]>([]);

  useSocket<PrivateMessageReceivedPayload>(WS_EVENTS.PRIVATE_MESSAGE_RECEIVED, (payload) => {
    setRecibidos((prev) => [{ ...payload, recibidoEn: new Date().toISOString() }, ...prev]);

    if (payload.destinatarioPersonaId) {
      socket.emit(WS_EVENTS.MARK_MESSAGE_READ, {
        destinatarioPersonaId: payload.destinatarioPersonaId,
      });
    }
  });

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '1rem',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.7rem',
      }}
    >
      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>📥 Recibidos (en vivo)</h4>

      <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>
        Los mensajes que lleguen mientras tengas esta sección abierta se marcan
        automáticamente como leídos.
      </p>

      {recibidos.length === 0 && (
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
          Aún no ha llegado ningún mensaje en esta sesión.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '420px', overflowY: 'auto' }}>
        {recibidos.map((r) => (
          <div
            key={r.mensajeId}
            style={{
              border: '1px solid rgba(52,211,153,0.25)',
              borderRadius: '0.6rem',
              padding: '0.7rem',
              background: 'rgba(52,211,153,0.05)',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'white' }}>{r.contenido}</p>

            {typeof r.ubicacionLat === 'number' && typeof r.ubicacionLng === 'number' && (
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                📍 Ubicación adjunta ({r.ubicacionLat.toFixed(5)}, {r.ubicacionLng.toFixed(5)})
              </p>
            )}

            <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
              Recibido {new Date(r.recibidoEn).toLocaleTimeString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}