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
  
  // Datos cruzados para la UI
  nombre_estudiante: string;
  rut_estudiante: string;
  nombre_periodo: string;
  numero_habitacion: string;
  nombre_edificio: string;
}