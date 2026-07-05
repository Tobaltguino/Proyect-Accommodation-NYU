// Enums
export enum EstadoAsignacion {
  ACTIVA = 'Activa',
  FINALIZADA = 'Finalizada',
  RENUNCIADA = 'Renunciada'
}

export enum EstadoPago {
  PENDIENTE = 'Pendiente',
  PAGADO = 'Pagado',
  VENCIDO = 'Vencido'
}

// DTO Asignacion
export interface AsignacionDTO {
  idAsignacion: number;
  fechaAsignacion: string;
  fechaCheckIn: string | null;
  fechaCheckOut: string | null;
  estado: EstadoAsignacion;
  
  idPeriodo: number;
  idEdificio?: number;
  idHabitacion: number;

  nombrePeriodo?: string;
  nombreEdificio?: string;
  numeroHabitacion?: string; 

  rutEstudiante: string;
  rutAdmin: string | null;

  nombreEstudiante?: string;
  nombreAdmin?: string;

  fechaPago?: string | null;
  idPago?: string | null;
  estadoPago?: EstadoPago | string | null;
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