// src/modules/messages/components/MessageComposer.tsx
//
// Redactor de mensaje privado (máx 500 caracteres), con opción de adjuntar
// la ubicación actual del remitente (útil p.ej. para decir "estoy aquí
// esperando el bus"). La ubicación se obtiene una sola vez al activar el
// toggle (no se actualiza en vivo), justo antes de enviar.

import { useState } from 'react';
import { messagesService } from '../services/messages.service';
import type { Persona } from '../types/message';
import { useAuthContext } from '../../../features/auth/context/AuthContext';

interface Props {
  destinatario: Persona | null;
  onSent: () => void;
}

const MAX_CHARS = 500;

export default function MessageComposer({ destinatario, onSent }: Props) {
  const { user } = useAuthContext();

  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [adjuntarUbicacion, setAdjuntarUbicacion] = useState(false);
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);
  const [ubicacionError, setUbicacionError] = useState<string | null>(null);

  const handleToggleUbicacion = () => {
    if (adjuntarUbicacion) {
      // Se desactiva: se descarta la ubicación ya obtenida.
      setAdjuntarUbicacion(false);
      setUbicacion(null);
      setUbicacionError(null);
      return;
    }

    if (!navigator.geolocation) {
      setUbicacionError('Tu navegador no soporta geolocalización.');
      return;
    }

    setAdjuntarUbicacion(true);
    setObteniendoUbicacion(true);
    setUbicacionError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setObteniendoUbicacion(false);
      },
      () => {
        setUbicacionError('No se pudo obtener tu ubicación. Revisa los permisos del navegador.');
        setObteniendoUbicacion(false);
        setAdjuntarUbicacion(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleSend = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!destinatario) {
      setError('Selecciona un destinatario antes de enviar.');
      return;
    }

    if (!contenido.trim()) {
      setError('Escribe un mensaje antes de enviar.');
      return;
    }

    if (!user?.personaId) {
      setError('No se encontró tu información de persona. Intenta recargar la página.');
      return;
    }

    setLoading(true);

    try {
      const mensaje = await messagesService.createMessage({
        contenido,
        fechaEnvio: new Date().toISOString(),
        emisorId: user.personaId,
        ...(adjuntarUbicacion && ubicacion
          ? { ubicacionLat: ubicacion.lat, ubicacionLng: ubicacion.lng }
          : {}),
      });

      await messagesService.assignRecipient({
        mensajeId: mensaje.id,
        personaId: destinatario.id,
      });

      setContenido('');
      setAdjuntarUbicacion(false);
      setUbicacion(null);
      onSent();
      setSuccessMessage('Mensaje enviado.');
    } catch (err) {
      console.error(err);
      setError('No se pudo enviar el mensaje. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

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
        ✉️ Para:{' '}
        <span style={{ color: destinatario ? '#a5b4fc' : '#94a3b8' }}>
          {destinatario ? `${destinatario.firstName} ${destinatario.lastName}` : 'Ningún destinatario seleccionado'}
        </span>
      </h4>

      <textarea
        maxLength={MAX_CHARS}
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        placeholder="Escribe tu mensaje..."
        rows={5}
        style={{
          width: '100%',
          background: '#1e293b',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '0.5rem',
          padding: '0.6rem',
          fontSize: '0.85rem',
          resize: 'vertical',
          fontFamily: 'inherit',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          {contenido.length}/{MAX_CHARS}
        </span>

        <button
          onClick={handleToggleUbicacion}
          disabled={obteniendoUbicacion}
          style={{
            background: adjuntarUbicacion ? 'rgba(99,102,241,0.18)' : 'transparent',
            color: adjuntarUbicacion ? '#a5b4fc' : '#94a3b8',
            border: `1px solid ${adjuntarUbicacion ? '#6366f1' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: '0.5rem',
            padding: '0.35rem 0.7rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: obteniendoUbicacion ? 'default' : 'pointer',
          }}
        >
          {obteniendoUbicacion
            ? '📍 Obteniendo ubicación…'
            : adjuntarUbicacion
              ? '📍 Ubicación adjunta ✕'
              : '📍 Adjuntar ubicación'}
        </button>
      </div>

      {ubicacionError && (
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#f59e0b' }}>{ubicacionError}</p>
      )}

      {adjuntarUbicacion && ubicacion && (
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
          Se enviará tu ubicación actual ({ubicacion.lat.toFixed(5)}, {ubicacion.lng.toFixed(5)}).
        </p>
      )}

      {error && <p style={{ margin: 0, fontSize: '0.8rem', color: '#ef4444' }}>{error}</p>}
      {successMessage && (
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#34d399' }}>{successMessage}</p>
      )}

      <button
        onClick={handleSend}
        disabled={loading || obteniendoUbicacion}
        style={{
          background: loading ? 'rgba(99,102,241,0.4)' : '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '0.6rem',
          padding: '0.65rem',
          fontWeight: 600,
          cursor: loading ? 'default' : 'pointer',
        }}
      >
        {loading ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </div>
  );
}