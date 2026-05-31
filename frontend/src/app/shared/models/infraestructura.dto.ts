export enum Genero {
  MASCULINO = 'Masculino',
  FEMENINO = 'Femenino',
  MIXTO = 'Mixto'
}

export interface HabitacionDTO {
  idHabitacion: number;    
  nroHabitacion: number;   
  capacidadActual: number; 
  capacidadTotal: number; 
  disponibilidad: boolean;
  idPiso: number;          
}

export interface PisoDTO {
  idPiso: number;          
  nroPiso: number;         
  nombre: string;
  idEdificio: number;      

  habitaciones?: HabitacionDTO[]; 
}

export interface EdificioDTO {
  idEdificio: number;      
  nombre: string;
  ubicacion: string;
  genero: Genero; 
  
  pisos?: PisoDTO[]; 
}