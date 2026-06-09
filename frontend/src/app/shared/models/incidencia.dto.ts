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
  idHabitacion: number; 
  
  rutEstudiante: string;
  rutAdmin: string | null;

  nroHabitacion?: number; 
  nombreEdificio?: string;
  nombreEstudiante?: string;
  periodo?: string;
  nombreAdmin?: string;
}