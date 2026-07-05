
// Enums
export enum EstadoAsignacion {
  ACTIVA = 'Activa',
  FINALIZADA = 'Finalizada',
  RENUNCIADA = 'Renunciada'
}

// DTO Asignacion
export interface AsignacionDTO {
  idAsignacion: number;
  fechaAsignacion: string;
  fechaCheckIn: string | null;
  fechaCheckOut: string | null;
  estado: EstadoAsignacion;
  
  idHabitacion: number;
  idPeriodo: number;
  
  rutEstudiante: string;
  rutAdmin: string | null;

  numeroHabitacion?: string; 
  idEdificio?: number;
  nombreEdificio?: string;
  nombrePeriodo?: string;
  nombreEstudiante?: string;
  nombreAdmin?: string;
}

// REQUESTS 
export interface CrearAsignacionRequest {
  idSolicitud: number;
  idHabitacion: number;
}

export interface ReasignarHabitacionRequest {
  idNuevaHabitacion: number;
}

// RESPONSES
export interface AsignacionActivaResponse {
  tieneAsignacion: boolean;
  message?: string;
  asignacion?: AsignacionDTO;
}

export interface MiAsignacionResponse {
  tieneAsignacion?: boolean;
  asignacion?: AsignacionDTO; 
  planDieta?: any;
}