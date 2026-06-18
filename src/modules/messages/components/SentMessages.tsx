// src/modules/messages/components/SentMessages.tsx
//
// Bandeja de mensajes enviados, con el estado de lectura de cada
// destinatario (✓ leído con timestamp, o "sin leer"). El backend ya trae
// la relación destinatariosPersona en /mensaje/enviados/:personaId, así
// que no se necesita ninguna llamada adicional.
//
// Además escucha 'private_message_read' en tiempo real: si el destinatario
// marca el mensaje como leído mientras esta bandeja está abierta, el
// estado se actualiza sin necesidad de recargar.

import { useEffect, useState } from 'react';
import { messagesService } from '../services/messages.service';
import type { Mensaje, PrivateMessageReadPayload } from '../types/message';
import { useSocket } from '../../../websocket/hooks/useSocket';
import { WS_EVENTS } from '../../../websocket/events';

interface Props {
  personaId: string;
  refresh: number;
}

export default function SentMessages({ personaId, refresh }: Props) {
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!personaId) return;
    setIsLoading(true);
    messagesService
      .getSentMessages(personaId)
      .then(setMessages)
      .finally(() => setIsLoading(false));
  }, [personaId, refresh]);

  // Actualiza en vivo el estado de lectura cuando llega la confirmación,
  // sin esperar a que el componente se vuelva a montar o a recargar.
  useSocket<PrivateMessageReadPayload>(WS_EVENTS.PRIVATE_MESSAGE_READ, (payload) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== payload.mensajeId) return m;
        return {
          ...m,
          destinatariosPersona: m.destinatariosPersona?.map((dp) =>
            dp.persona.id === payload.lectorPersonaId
              ? { ...dp, leido: true, fechaLectura: payload.fechaLectura }
              : dp,
          ),
        };
      }),
    );
  });

  if (isLoading) {
    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '1rem',
          padding: '1.25rem',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Cargando mensajes…</p>
      </div>
    );
  }

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
      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>📤 Enviados</h4>

      {messages.length === 0 && (
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
          Aún no has enviado ningún mensaje.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '420px', overflowY: 'auto' }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.6rem',
              padding: '0.7rem',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'white' }}>{m.contenido}</p>

            {typeof m.ubicacionLat === 'number' && typeof m.ubicacionLng === 'number' && (
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                📍 Ubicación adjunta ({m.ubicacionLat.toFixed(5)}, {m.ubicacionLng.toFixed(5)})
              </p>
            )}

            <div
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                {new Date(m.fechaEnvio).toLocaleString()}
              </small>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-end' }}>
                {(m.destinatariosPersona ?? []).map((dp) => (
                  <span
                    key={dp.id}
                    style={{
                      fontSize: '0.72rem',
                      color: dp.leido ? '#34d399' : '#94a3b8',
                    }}
                  >
                    {dp.persona.firstName}:{' '}
                    {dp.leido
                      ? `✓ Leído ${dp.fechaLectura ? new Date(dp.fechaLectura).toLocaleTimeString() : ''}`
                      : 'Sin leer'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}