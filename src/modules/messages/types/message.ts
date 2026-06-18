export interface Persona {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Mensaje {
  id: string;
  contenido: string;
  fechaEnvio: string;

  // Ubicación opcional adjunta al mensaje (p.ej. "estoy aquí esperando el bus").
  ubicacionLat?: number;
  ubicacionLng?: number;

  emisor: Persona;

  // Presente cuando el mensaje viene del endpoint de "enviados", que trae
  // la relación destinatariosPersona con su estado de lectura por cada
  // destinatario.
  destinatariosPersona?: DestinatarioPersona[];
}

export interface DestinatarioPersona {
  id: string;
  leido: boolean;
  fechaLectura?: string;

  persona: Persona;

  // Presente cuando el destinatarioPersona viene cargado junto con su
  // mensaje (p.ej. al listar "recibidos").
  mensaje?: Mensaje;
}

export interface CreateMensajeDto {
  contenido: string;
  fechaEnvio: string;
  emisorId: string;
  ubicacionLat?: number;
  ubicacionLng?: number;
}

export interface CreateDestinatarioDto {
  mensajeId: string;
  personaId: string;
}

/** Payload del evento WebSocket 'private_message_received'. */
export interface PrivateMessageReceivedPayload {
  authId: string;
  mensajeId: string;
  contenido: string;
  fechaEnvio: string;
  emisorId: string;
  ubicacionLat?: number;
  ubicacionLng?: number;
  // id de la fila DestinatarioPersona, necesario para luego emitir
  // 'mark_message_read' con el id correcto.
  destinatarioPersonaId?: string;
}

/** Payload del evento WebSocket 'private_message_read'. */
export interface PrivateMessageReadPayload {
  authId: string;
  mensajeId: string;
  fechaLectura: string;
  lectorPersonaId?: string;
}