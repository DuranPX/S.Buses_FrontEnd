import { useEffect, useState } from 'react';
import { messagesService } from '../services/messages.service';
import type { Mensaje } from '../types/message';

interface Props {
  personaId: string;
  refresh: number;
}

export default function SentMessages({
  personaId,
  refresh,
}: Props) {

  const [messages, setMessages] =
    useState<Mensaje[]>([]);

  useEffect(() => {

    messagesService
      .getSentMessages(personaId)
      .then(setMessages);

  }, [personaId, refresh]);

  return (
    <div>

      <h3>Mensajes enviados</h3>

      {messages.map((m) => (

        <div
          key={m.id}
          style={{
            border: '1px solid #ddd',
            marginBottom: '8px',
            padding: '8px',
          }}
        >
          <div>
            {m.contenido}
          </div>

          <small>
            {new Date(
              m.fechaEnvio
            ).toLocaleString()}
          </small>

        </div>

      ))}

    </div>
  );
}