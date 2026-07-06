import { Genero } from './infraestructura.dto';

// Enums
export enum EstadoSolicitud {
  PENDIENTE = 'Pendiente',
  EN_REVISION = 'En Revision',
  APROBADA = 'Aprobada',
  RECHAZADA = 'Rechazada'
}

// DTO Solicitudes
export interface SolicitudDTO {
  idSolicitud: number;
  estado: EstadoSolicitud;
  fechaSolicitud: string;
  idPeriodo: number;
  
  rutEstudiante: string;
  rutAdmin: string | null;

  nombrePeriodo?: string;
  nombreEstudiante?: string; 
  generoEstudiante?: Genero; 
  nombreAdmin?: string;
}

// REQUESTS
export interface CambiarEstadoSolicitudRequest {
  estado: string;
}

// RESPONSE
export interface VerificarMatriculaResponse {
  esActivo: boolean;
}