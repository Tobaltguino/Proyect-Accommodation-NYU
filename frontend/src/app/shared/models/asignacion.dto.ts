// --- ASIGNACIONES ---
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
  
  // Nuevos identificadores externos
  rut_estudiante: string;
  rut_admin: string | null;

  // JOINs opcionales para mostrar en tablas
  numero_habitacion?: string; 
  id_edificio?: number;
  nombre_edificio?: string;
  nombre_periodo?: string;
  nombre_estudiante?: string;
  nombre_admin?: string;
}