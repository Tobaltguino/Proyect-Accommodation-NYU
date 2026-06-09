export enum TipoDieta {
  SIN_PREFERENCIA = 'Sin preferencia',
  VEGANO = 'Vegano',
  VEGETARIANO = 'Vegetariano',
  PECETARIANO = 'Pecetariano',
}

export interface DietaDTO {
  idPlan: number;
  tipoPlan: TipoDieta | string;
  idPeriodo: number;
  
  rutEstudiante: string;

  nombreEstudiante?: string;
  nombrePeriodo?: string;
}