import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../enums/role.enum';

export class RegisterDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(50, { message: 'El nombre supera el largo permitido' })
  fullName!: string;

  @IsString({ message: 'El RUT debe ser texto' })
  @IsNotEmpty({ message: 'El RUT es requerido' })
  @Matches(/^(?:\d{7,8}-[\dkK]|\d{1,2}\.\d{3}\.\d{3}-[\dkK])$/, {
    message: 'El RUT debe tener formato valido',
  })
  rut!: string;

  @IsString({ message: 'La contrasena debe ser texto' })
  @IsNotEmpty({ message: 'La contrasena es requerida' })
  @MinLength(8, { message: 'La contrasena debe tener al menos 8 caracteres' })
  @MaxLength(100, { message: 'La contrasena supera el largo permitido' })
  password!: string;

  @IsEnum(Role, { message: 'El rol es invalido' })
  role!: Role;
}
