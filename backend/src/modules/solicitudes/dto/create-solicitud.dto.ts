import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  MinLength,
} from 'class-validator';
import { MealPlan, StudentGender } from '../enums/solicitud.enums';

export class CreateSolicitudDto {
  @IsString({ message: 'La carrera debe ser texto' })
  @IsNotEmpty({ message: 'La carrera es requerida' })
  @MaxLength(120, { message: 'La carrera supera el largo permitido' })
  career!: string;

  @IsEnum(StudentGender, { message: 'El genero es invalido' })
  gender!: StudentGender;

  @IsString({ message: 'El telefono debe ser texto' })
  @IsNotEmpty({ message: 'El telefono es requerido' })
  @MaxLength(30, { message: 'El telefono supera el largo permitido' })
  phone!: string;

  @IsString({ message: 'La ciudad debe ser texto' })
  @IsNotEmpty({ message: 'La ciudad es requerida' })
  @MaxLength(80, { message: 'La ciudad supera el largo permitido' })
  city!: string;

  @IsEnum(MealPlan, { message: 'El plan alimenticio es invalido' })
  mealPlan!: MealPlan;

  @IsString({ message: 'La habitacion debe ser texto' })
  @Matches(/^\d{3}$/, { message: 'La habitacion debe tener formato valido' })
  roomCode!: string;

  @IsString({ message: 'El motivo debe ser texto' })
  @IsNotEmpty({ message: 'El motivo es requerido' })
  @MinLength(15, { message: 'El motivo debe tener al menos 15 caracteres' })
  motivation!: string;

  @IsString({ message: 'El semestre debe ser texto' })
  @IsOptional()
  @MaxLength(16, { message: 'El semestre supera el largo permitido' })
  semester?: string;
}
