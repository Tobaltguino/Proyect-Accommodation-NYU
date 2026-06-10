import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { StudentGender } from '../../solicitudes/enums/solicitud.enums';

export class AvailabilityQueryDto {
  @IsEnum(StudentGender, { message: 'El genero es invalido' })
  gender!: StudentGender;

  @IsString({ message: 'El semestre debe ser texto' })
  @IsOptional()
  @MaxLength(16, { message: 'El semestre supera el largo permitido' })
  semester?: string;
}
