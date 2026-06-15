export enum EstadoAsignacion {
  ACTIVA = 'Activa',
  FINALIZADA = 'Finalizada',
  RENUNCIADA = 'Renunciada'
}

export interface AsignacionDTO {
  idAsignacion: number;
  fechaAsignacion: string;
  fechaCheckIn: string | null;
  fechaCheckOut: string | null;
  estado: EstadoAsignacion;
  
  idHabitacion: number;
  idPeriodo: number;
  
  rutEstudiante: string;
  rutAdmin: string | null;

  numeroHabitacion?: string; 
  idEdificio?: number;
  nombreEdificio?: string;
  ubicacionEdificio?: string;
  idPiso?: number;
  numeroPiso?: number;
  nombrePiso?: string;
  nombrePeriodo?: string;
  nombreEstudiante?: string;
  nombreAdmin?: string;
}
