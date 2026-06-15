export type TipoMovimientoHistorial =
  | 'ASIGNACION'
  | 'CHECK_IN'
  | 'REASIGNACION'
  | 'CHECK_OUT'
  | 'RENUNCIA';

export interface HabitacionHistorialDTO {
  idHabitacion: number;
  numeroHabitacion: string;
  nombreEdificio: string;
}

export interface HistorialResidenciaDTO {
  idHistorial: string;
  tipoMovimiento: TipoMovimientoHistorial;
  fechaMovimiento: string;
  rutEstudiante: string;
  rutAdmin: string | null;
  idAsignacion: number;
  idHabitacionAnterior: number | null;
  idHabitacionNueva: number | null;
  estadoAnterior: string | null;
  estadoNuevo: string | null;
  observacion: string | null;
  idPeriodo: number | null;
  nombrePeriodo: string;
  habitacionAnterior: HabitacionHistorialDTO | null;
  habitacionNueva: HabitacionHistorialDTO | null;
}
