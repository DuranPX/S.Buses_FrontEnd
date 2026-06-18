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

  emisor: Persona;
}

export interface DestinatarioPersona {
  id: string;
  leido: boolean;
  fechaLectura?: string;

  persona: Persona;
}

export interface CreateMensajeDto {
  contenido: string;
  fechaEnvio: string;
  emisorId: string;
}

export interface CreateDestinatarioDto {
  mensajeId: string;
  personaId: string;
}