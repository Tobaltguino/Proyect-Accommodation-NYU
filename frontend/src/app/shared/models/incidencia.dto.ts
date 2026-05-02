export enum EstadoIncidencia {
  PENDIENTE = 'Pendiente',
  EN_PROCESO = 'En Proceso',
  RESUELTA = 'Resuelta'
}

export enum GravedadIncidencia {
  LEVE = 'Leve',
  MODERADO = 'Moderado',
  GRAVE = 'Grave'
}

export interface IncidenciaDTO {
  id_incidencia: number;
  descripcion: string;
  estado: EstadoIncidencia;
  fecha: string;
  gravedad: GravedadIncidencia;
  nro_habitacion: number;
  nombre_edificio: string;
  rut_usuario: string;
  nombre_usuario: string;
  periodo: string;
}