import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export enum GravedadIncidencia {
  LEVE = 'Leve',
  MODERADO = 'Moderado',
  GRAVE = 'Grave',
}

export class CreateIncidenciaDto {
  @IsString({ message: 'La descripcion debe ser texto' })
  @IsNotEmpty({ message: 'La descripcion es requerida' })
  @MinLength(10, {
    message: 'La descripcion debe tener al menos 10 caracteres',
  })
  @MaxLength(500, { message: 'La descripcion supera el largo permitido' })
  descripcion!: string;

  @IsEnum(GravedadIncidencia, { message: 'La gravedad es invalida' })
  gravedad!: GravedadIncidencia;

  @IsInt({ message: 'idHabitacion debe ser numerico' })
  @Min(1, { message: 'idHabitacion debe ser mayor a cero' })
  idHabitacion!: number;

  @IsString({ message: 'El rut del estudiante debe ser texto' })
  @IsNotEmpty({ message: 'El rut del estudiante es requerido' })
  @MaxLength(20, { message: 'El rut del estudiante supera el largo permitido' })
  rutEstudiante!: string;

  @IsOptional()
  @IsString({ message: 'El rut del administrador debe ser texto' })
  @MaxLength(20, {
    message: 'El rut del administrador supera el largo permitido',
  })
  rutAdmin?: string;
}
