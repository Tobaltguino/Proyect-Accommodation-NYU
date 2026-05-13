import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum EstadoIncidencia {
  PENDIENTE = 'Pendiente',
  EN_PROCESO = 'En Proceso',
  RESUELTA = 'Resuelta',
}

export class UpdateIncidenciaEstadoDto {
  @IsEnum(EstadoIncidencia, { message: 'El estado es invalido' })
  estado!: EstadoIncidencia;

  @IsOptional()
  @IsString({ message: 'El RUT de administrador es invalido' })
  rutAdmin?: string;
}
