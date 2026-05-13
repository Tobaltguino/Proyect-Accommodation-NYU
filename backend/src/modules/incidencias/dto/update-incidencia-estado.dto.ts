import { IsEnum } from 'class-validator';

export enum EstadoIncidencia {
  PENDIENTE = 'Pendiente',
  EN_PROCESO = 'En Proceso',
  RESUELTA = 'Resuelta',
}

export class UpdateIncidenciaEstadoDto {
  @IsEnum(EstadoIncidencia, { message: 'El estado es invalido' })
  estado!: EstadoIncidencia;
}
