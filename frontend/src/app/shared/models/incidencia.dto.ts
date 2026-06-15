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
  idPiso?: number;
  nroPiso?: number;
  nombreEdificio?: string;
  ubicacion?: string;
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
  nroHabitacion?: number;
  idPiso?: number;
  nroPiso?: number;
  nombreEdificio?: string;
  ubicacion?: string;
  rutEstudiante: string;
  rutAdmin: string | null;
}

export interface EvaluacionResidencialDTO {
  rutEstudiante: string;
  puntaje: number;
  nivel: 'BAJO' | 'MEDIO' | 'ALTO';
  totalIncidencias: number;
  incidenciasGraves: number;
  recomendacion: string;
}

export interface IncidenciaFilters {
  semester?: string;
  gravedad?: GravedadIncidencia;
  rut?: string;
}
