export enum TipoDieta {
  SIN_PREFERENCIA = 'Sin preferencia',
  VEGANO = 'Vegano',
  VEGETARIANO = 'Vegetariano',
  PECETARIANO = 'Pecetariano',
}

export interface DietaDTO {
  id_plan: number;
  tipo_plan: TipoDieta | string;
  id_periodo: number;
  
  // Identificador externo (Según tu SQL, la dieta solo tiene rut_estudiante)
  rut_estudiante: string;

  // JOINs opcionales para mostrar en tablas
  nombre_estudiante?: string;
  nombre_periodo?: string;
}