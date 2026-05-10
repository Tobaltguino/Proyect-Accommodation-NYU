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
  id_incidencia: number;
  descripcion: string;
  estado: EstadoIncidencia;
  fecha: string;
  gravedad: GravedadIncidencia;
  id_habitacion: number; // Base de datos real
  
  // Nuevos identificadores externos
  rut_estudiante: string;
  rut_admin: string | null;

  // JOINs opcionales para mostrar en tablas
  nro_habitacion?: number; 
  nombre_edificio?: string;
  nombre_estudiante?: string;
  periodo?: string;
  nombre_admin?: string;
}