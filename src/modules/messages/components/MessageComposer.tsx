import { useState } from 'react';
import { messagesService } from '../services/messages.service';
import type { Persona } from '../types/message';
import { useAuthContext } from '../../../features/auth/context/AuthContext';

interface Props {
  destinatario: Persona | null;
  onSent: () => void;
}

export default function MessageComposer({
  destinatario,
  onSent,
}: Props) {

  const { user } = useAuthContext();

  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {

    if (!destinatario) {
      alert('Selecciona un usuario');
      return;
    }

    if (!user?.personaId) {
      alert('No se encontró personaId');
      return;
    }

    setLoading(true);

    try {

      const mensaje =
        await messagesService.createMessage({
          contenido,
          fechaEnvio: new Date().toISOString(),
          emisorId: user.personaId,
        });

      await messagesService.assignRecipient({
        mensajeId: mensaje.id,
        personaId: destinatario.id,
      });

      setContenido('');
      onSent();

      alert('Mensaje enviado');

    } catch (error) {
      console.error(error);
      alert('Error enviando mensaje');
    }

    setLoading(false);
  };

  return (
    <div>

      <h3>
        Destinatario:
        {' '}
        {destinatario
          ? `${destinatario.firstName} ${destinatario.lastName}`
          : 'Ninguno'}
      </h3>

      <textarea
        maxLength={500}
        value={contenido}
        onChange={(e) =>
          setContenido(e.target.value)
        }
      />

      <div>
        {contenido.length}/500
      </div>

      <button
        onClick={handleSend}
        disabled={loading}
      >
        Enviar
      </button>

    </div>
  );
}