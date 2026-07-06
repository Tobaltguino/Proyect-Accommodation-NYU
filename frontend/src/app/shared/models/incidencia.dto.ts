// Enums
export enum GravedadIncidencia {
  LEVE = 'Leve',
  MODERADO = 'Moderado',
  GRAVE = 'Grave'
}

// DTOS Incidencia
export interface IncidenciaDTO {
  idIncidencia: number;
  descripcion: string;
  fecha: string;
  gravedad: GravedadIncidencia;
  idHabitacion: number; 

  rutEstudiante: string;
  rutAdmin: string | null;

  nroHabitacion?: number;
  numeroPiso?: number;
  nombreEdificio?: string;
  nombreEstudiante?: string;
  periodo?: string;
  nombreAdmin?: string;
}

// REQUESTS 
export interface CreateIncidenciaRequest {
  descripcion: string;
  gravedad: GravedadIncidencia;
  idHabitacion: number;
  rutEstudiante: string;
  rutAdmin?: string;
}

// RESPONSES 
export interface IncidenciaApiResponse {
  idIncidencia: number;
  descripcion: string;
  fecha: string;
  gravedad: GravedadIncidencia;
  idHabitacion: number;
  rutEstudiante: string;
  rutAdmin: string | null;
  
  // Relaciones anidadas devueltas por TypeORM
  habitacion?: {
    idHabitacion: number;
    nroHabitacion: number;
    piso?: {
      nroPiso: number;
      edificio?: {
        nombre: string;
      };
    };
  };
}

// FILTROS Y OTROS
export interface IncidenciaFilters {
  semester?: string;
  gravedad?: GravedadIncidencia;
  rut?: string;
}