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
  rutEstudiante: string;
  rutAdmin: string | null;
  
  idPeriodo: number;
  idEdificio?: number;
  idHabitacion: number;

  nombrePeriodo?: string;
  nombreEdificio?: string;
  numeroHabitacion?: string; 

  capacidadActual?: number;
  capacidadTotal?: number;
  disponibilidadHabitacion?: boolean;

  idPiso?: number;
  numeroPiso?: number;
  nombrePiso?: string;

  generoEdificio?: string;

  nombreEstudiante?: string;
  nombreAdmin?: string;

  fechaPago?: string | null;
  referenceId?: string | null;
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
}