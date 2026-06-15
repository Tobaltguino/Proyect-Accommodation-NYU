export enum GravedadIncidencia {
  LEVE = 'Leve',
  MODERADO = 'Moderado',
  GRAVE = 'Grave'
}

export interface IncidenciaDTO {
  idIncidencia: number;
  descripcion: string;
  fecha: string;
  gravedad: GravedadIncidencia;
  idHabitacion: number; // Base de datos real

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
  fecha: string;
  gravedad: GravedadIncidencia;
  idHabitacion: number;
  rutEstudiante: string;
  rutAdmin: string | null;
}

export interface IncidenciaFilters {
  semester?: string;
  gravedad?: GravedadIncidencia;
  rut?: string;
}
