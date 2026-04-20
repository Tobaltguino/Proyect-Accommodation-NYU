import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'El RUT debe ser texto' })
  @IsNotEmpty({ message: 'El RUT es requerido' })
  @Matches(/^(?:\d{7,8}-[\dkK]|\d{1,2}\.\d{3}\.\d{3}-[\dkK])$/, {
    message: 'El RUT debe tener formato valido',
  })
  rut!: string;

  @IsString({ message: 'La contrasena debe ser texto' })
  @IsNotEmpty({ message: 'La contrasena es requerida' })
  password!: string;
}
