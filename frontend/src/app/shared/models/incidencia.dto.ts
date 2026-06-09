export enum EstadoIncidencia {
  PENDIENTE = 'Pendiente',
  EN_PROCESO = 'En Proceso',
  RESUELTA = 'Resuelta'
}

export enum GravedadIncidencia {
  LEVE = 'Leve',
  MODERADO = 'Moderado',
  GRAVE = 'Grave'
}

export interface IncidenciaDTO {
  idIncidencia: number;
  descripcion: string;
  estado: EstadoIncidencia;
  fecha: string;
  gravedad: GravedadIncidencia;
  id_habitacion: number; // Base de datos real

  rutEstudiante: string;
  rutAdmin: string | null;

  nroHabitacion?: number;
  nombreEdificio?: string;
  nombreEstudiante?: string;
  periodo?: string;
  nombreAdmin?: string;
}

export interface CreateIncidenciaRequest {
  descripcion: string;
  gravedad: GravedadIncidencia;
  idHabitacion: number;
  rutEstudiante: string;
  rutAdmin?: string;
}

export interface IncidenciaApiResponse {
  idIncidencia: number;
  descripcion: string;
  estado: EstadoIncidencia;
  fecha: string;
  gravedad: GravedadIncidencia;
  idHabitacion: number;
  rutEstudiante: string;
  rutAdmin: string | null;
}

export interface IncidenciaFilters {
  semester?: string;
  estado?: EstadoIncidencia;
  gravedad?: GravedadIncidencia;
  rut?: string;
}

export interface UpdateIncidenciaEstadoRequest {
  estado: EstadoIncidencia;
  rutAdmin?: string;
}
