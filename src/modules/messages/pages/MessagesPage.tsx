import { useState } from 'react';

import UserSearch from '../components/UserSearch';
import MessageComposer from '../components/MessageComposer';
import SentMessages from '../components/SentMessages';

import type { Persona } from '../types/message';

import { useAuthContext }
from '../../../features/auth/context/AuthContext';

import { useSocket }
from '../../../websocket/hooks/useSocket';

export default function MessagesPage() {

  const { user } = useAuthContext();

  const [selectedUser, setSelectedUser] =
    useState<Persona | null>(null);

  const [refresh, setRefresh] =
    useState(0);

  useSocket(
    'private_message_received',
    (data) => {

      console.log(
        'Mensaje recibido',
        data,
      );

      alert('Nuevo mensaje recibido');
      setRefresh((v) => v + 1);
    },
  );

  useSocket(
    'private_message_read',
    (data) => {

      console.log(
        'Mensaje leído',
        data,
      );

      alert('Un mensaje fue leído');
    },
  );

    console.log("USER:", user);
    console.log("PERSONA ID:", user?.personaId);
    if (!user) {
    return (
        <div>
        Cargando usuario...
        </div>
    );
    }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          '1fr 2fr 2fr',
        gap: '20px',
      }}
    >

      <UserSearch
        onSelect={setSelectedUser}
      />

      <MessageComposer
        destinatario={selectedUser}
        onSent={() =>
          setRefresh((v) => v + 1)
        }
      />

      <SentMessages
        personaId={user.personaId ?? ''}
        refresh={refresh}
      />

    </div>
  );
}