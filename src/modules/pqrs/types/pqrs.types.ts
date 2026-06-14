export interface CrearPQRSRequest {
  tipo: string;
  categoria: string;
  descripcion: string;
  emailContacto: string;
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
}