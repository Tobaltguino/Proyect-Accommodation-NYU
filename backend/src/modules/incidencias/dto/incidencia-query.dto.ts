import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { GravedadIncidencia } from './create-incidencia.dto';

export class IncidenciaQueryDto {
  @IsOptional()
  @IsString({ message: 'El semestre debe ser texto' })
  @MaxLength(16, { message: 'El semestre supera el largo permitido' })
  semester?: string;

  @IsOptional()
  @IsEnum(GravedadIncidencia, { message: 'La gravedad es invalida' })
  gravedad?: GravedadIncidencia;

  @IsOptional()
  @IsString({ message: 'El rut debe ser texto' })
  @MaxLength(20, { message: 'El rut supera el largo permitido' })
  rut?: string;
}
