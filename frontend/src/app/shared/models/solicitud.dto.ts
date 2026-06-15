import { Genero } from './infraestructura.dto';

export enum EstadoSolicitud {
  PENDIENTE = 'Pendiente',
  EN_REVISION = 'En Revision',
  APROBADA = 'Aprobada',
  RECHAZADA = 'Rechazada',
  FINALIZADA = 'Finalizada'
}

export interface SolicitudDTO {
  idSolicitud: number;
  estado: EstadoSolicitud;
  fechaSolicitud: string;
  idPeriodo: number;
  idAsignacion?: number | null;
  
  rutEstudiante: string;
  rutAdmin: string | null;

  nombrePeriodo?: string;
  nombreEstudiante?: string; 
  generoEstudiante?: Genero; 
  nombreAdmin?: string;
}
