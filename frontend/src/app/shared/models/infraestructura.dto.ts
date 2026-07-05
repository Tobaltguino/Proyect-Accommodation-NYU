// Enums
export enum Genero {
  MASCULINO = 'Masculino',
  FEMENINO = 'Femenino',
  MIXTO = 'Mixto'
}

// DTO Habitacion
export interface HabitacionDTO {
  idHabitacion: number;    
  nroHabitacion: number;   
  capacidadActual: number; 
  capacidadTotal: number; 
  disponibilidad: boolean;
  idPiso: number;          
}

// DTO Piso
export interface PisoDTO {
  idPiso: number;          
  nroPiso: number;         
  nombre: string;
  idEdificio: number;      
  habitaciones?: HabitacionDTO[]; 
}

// DTO Edificio
export interface EdificioDTO {
  idEdificio: number;      
  nombre: string;
  ubicacion: string;
  genero: Genero; 
  pisos?: PisoDTO[]; 
}

// DTOS Habitacion con detalle
export interface HabitacionDetalleDTO extends HabitacionDTO {
  piso?: PisoDTO;
  edificio?: EdificioDTO;
}

// REQUESTS 
export interface CrearPisoRequest {
  nroPiso: number;
  nombre: string;
  idEdificio: number;
}

export interface CrearHabitacionRequest {
  nroHabitacion: number;
  capacidadActual: number;
  disponibilidad: boolean;
  idPiso: number;
}