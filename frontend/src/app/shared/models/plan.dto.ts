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
  id_usuario: number;

  // 👇 AGREGA ESTOS CAMPOS COMO OPCIONALES 👇
  nombre_estudiante?: string;
  rut_estudiante?: string;
  nombre_periodo?: string;
}