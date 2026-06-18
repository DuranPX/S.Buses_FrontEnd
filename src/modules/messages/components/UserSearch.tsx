// src/modules/messages/components/UserSearch.tsx
//
// Buscador de usuarios por nombre o email (GET /persona/search?q=...).
// Con debounce para no disparar una request por cada tecla, y estados de
// carga/vacío/error para que la UI no se quede "muda" mientras espera.

import { useEffect, useRef, useState } from 'react';
import { messagesService } from '../services/messages.service';
import type { Persona } from '../types/message';

interface Props {
  onSelect: (user: Persona) => void;
  selectedUserId?: string;
}

const DEBOUNCE_MS = 350;

export default function UserSearch({ onSelect, selectedUserId }: Props) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setUsers([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await messagesService.searchUsers(trimmed);
        setUsers(result);
      } catch {
        setError('No se pudo buscar usuarios. Intenta de nuevo.');
      } finally {
        setIsLoading(false);
        setHasSearched(true);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '1rem',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
        👤 Buscar destinatario
      </h4>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Nombre o email..."
        style={{
          width: '100%',
          background: '#1e293b',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '0.5rem',
          padding: '0.55rem 0.6rem',
          fontSize: '0.85rem',
        }}
      />

      {isLoading && (
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>Buscando…</p>
      )}

      {error && (
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#ef4444' }}>{error}</p>
      )}

      {!isLoading && !error && hasSearched && users.length === 0 && (
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
          No se encontraron usuarios con ese nombre o email.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '260px', overflowY: 'auto' }}>
        {users.map((user) => {
          const isSelected = user.id === selectedUserId;
          return (
            <div
              key={user.id}
              onClick={() => onSelect(user)}
              style={{
                cursor: 'pointer',
                padding: '0.6rem 0.7rem',
                borderRadius: '0.5rem',
                border: `1px solid ${isSelected ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                background: isSelected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: isSelected ? '#a5b4fc' : 'white' }}>
                {user.firstName} {user.lastName}
              </p>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                {user.email}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}