export interface AsignacionDTO {
  idAsignacion: number;
  fechaAsignacion: Date;
  fechaCheckIn: Date | null;
  fechaCheckOut: Date | null;
  estado: string;
  rutEstudiante: string;
  rutAdmin: string | null;
  nombrePeriodo: string;
  numeroHabitacion: string;
  nombreEdificio: string;
  idPeriodo: number;
  idHabitacion: number;

  capacidadActual: number;
  capacidadTotal: number;
  disponibilidadHabitacion: boolean;

  idPiso?: number;
  numeroPiso?: number;
  nombrePiso?: string;

  idEdificio?: number;
  generoEdificio?: string;
}

export interface RespuestaMiAsignacion {
  tieneAsignacion: boolean;
  message?: string;
  asignacion?: AsignacionDTO;
}
