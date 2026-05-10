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
  
  // Nuevos identificadores externos
  rut_estudiante: string;
  rut_admin: string | null;

  // JOINs opcionales para mostrar en tablas
  nombre_periodo?: string;
  nombre_estudiante?: string; 
  genero_estudiante?: Genero; 
  nombre_admin?: string;
}