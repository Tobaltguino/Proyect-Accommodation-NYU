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
}