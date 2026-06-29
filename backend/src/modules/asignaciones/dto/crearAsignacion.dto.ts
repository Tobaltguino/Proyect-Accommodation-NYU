import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CrearAsignacionDTO {
  @IsNotEmpty({ message: 'El ID de la solicitud no puede estar vacío.' })
  @IsInt({ message: 'El ID de la solicitud debe ser un número entero.' })
  @Min(1, { message: 'El ID de la solicitud no es válido.' })
  idSolicitud!: number;

  @IsNotEmpty({ message: 'El ID de la habitación no puede estar vacío.' })
  @IsInt({ message: 'El ID de la habitación debe ser un número entero.' })
  @Min(1, { message: 'El ID de la habitación no es válida.' })
  idHabitacion!: number;
}
