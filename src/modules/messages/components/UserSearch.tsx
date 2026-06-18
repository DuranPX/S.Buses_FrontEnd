import { useState } from 'react';
import { messagesService } from '../services/messages.service';
import type { Persona } from '../types/message';

interface Props {
  onSelect: (user: Persona) => void;
}

export default function UserSearch({
  onSelect,
}: Props) {

  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<Persona[]>([]);

  const handleSearch = async () => {

    if (!query.trim()) return;

    const result =
      await messagesService.searchUsers(query);

    setUsers(result);
  };

  return (
    <div>

      <h3>Buscar Usuario</h3>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={handleSearch}>
        Buscar
      </button>

      {users.map((user) => (

        <div
          key={user.id}
          onClick={() => onSelect(user)}
          style={{
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          {user.firstName} {user.lastName}
        </div>

      ))}

    </div>
  );
}