export enum Genero {
  MASCULINO = 'Masculino',
  FEMENINO = 'Femenino',
  MIXTO = 'Mixto'
}

export interface HabitacionDTO {
  id_habitacion: number;
  nro_habitacion: number;
  capacidad_actual: number;
  capacidad_total: number;
  disponibilidad: boolean;
  id_piso: number;
}

export interface PisoDTO {
  id_piso: number;
  nro_piso: number;
  nombre: string;
  id_edificio: number;
  habitaciones: HabitacionDTO[];
}

export interface EdificioDTO {
  id_edificio: number;
  nombre: string;
  ubicacion: string;
  genero: Genero; 
  pisos: PisoDTO[];
}