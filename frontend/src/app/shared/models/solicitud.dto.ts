import { Genero } from './infraestructura.dto';

export enum EstadoSolicitud {
  PENDIENTE = 'Pendiente',
  EN_REVISION = 'En Revision',
  APROBADA = 'Aprobada',
  RECHAZADA = 'Rechazada'
}

export interface SolicitudDTO {
  id_solicitud: number;
  estado: EstadoSolicitud;
  fecha_solicitud: string;
  id_periodo: number;
  nombre_periodo: string;
  id_usuario: number;
  rut_usuario: string;
  nombre_usuario: string;
  genero_usuario: Genero; 
}