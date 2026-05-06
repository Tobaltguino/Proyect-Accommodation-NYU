export enum EstadoAsignacion {
  ACTIVA = 'Activa',
  FINALIZADA = 'Finalizada',
  RENUNCIADA = 'Renunciada'
}

export interface AsignacionDTO {
  id_asignacion: number;
  fecha_asignacion: string;
  fecha_check_in: string | null;
  fecha_check_out: string | null;
  estado: EstadoAsignacion;
  
  id_habitacion: number;
  id_periodo: number;
  id_usuario: number;

  // Son los datos "unidos" (JOINs) que necesitamos para mostrar en las tablas
  numero_habitacion?: string; 
  id_edificio?: number;
  nombre_edificio?: string;
  nombre_periodo?: string;
  rut_estudiante?: string;
  nombre_estudiante?: string;
}