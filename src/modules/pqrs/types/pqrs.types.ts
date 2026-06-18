// pqrs.types.ts
export interface CrearPQRSRequest {
  tipo: string;
  categoria: string;
  descripcion: string;
  emailContacto: string;
  fotos?: File[];
}

export interface PQRS {
  id?: string;
  radicado: string;
  tipo: string;
  categoria: string;
  descripcion: string;
  estado: string;
  respuesta?: string;
  emailContacto: string;
  tiempoEstimado?: string;
  departamento?: string;
  creadoEn?: string;
  fotos?: PqrsFoto[];
}

export interface PqrsFoto {
  id: string;
  nombreOriginal: string;
  mimeType: string;
  orden: number;
}

export interface CambiarEstadoPQRSRequest {
  estado: string;
  respuesta?: string;
  emailContacto: string;
}

export interface CrearPQRSResponse {
  success: boolean;
  message?: string;
  radicado?: string;
  id?: string;
}