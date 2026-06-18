import { useState } from 'react';

import UserSearch from '../components/UserSearch';
import MessageComposer from '../components/MessageComposer';
import SentMessages from '../components/SentMessages';
import ReceivedMessages from '../components/ReceivedMessages';

import type { Persona } from '../types/message';

import { useAuthContext } from '../../../features/auth/context/AuthContext';

export default function MessagesPage() {
  const { user } = useAuthContext();

  const [selectedUser, setSelectedUser] = useState<Persona | null>(null);
  const [refresh, setRefresh] = useState(0);

  if (!user) {
    return <div>Cargando usuario...</div>;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.4fr 1.4fr 1.4fr',
        gap: '1.25rem',
        alignItems: 'start',
      }}
    >
      <UserSearch onSelect={setSelectedUser} selectedUserId={selectedUser?.id} />

      <MessageComposer
        destinatario={selectedUser}
        onSent={() => setRefresh((v) => v + 1)}
      />

      <SentMessages personaId={user.personaId ?? ''} refresh={refresh} />

      <ReceivedMessages />
    </div>
  );
}