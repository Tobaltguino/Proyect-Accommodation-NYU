import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MealPlan } from '../enums/solicitud.enums';
export class CreateSolicitudDto {
  @IsString({ message: 'El plan alimenticio debe ser un texto válido' })
  @IsNotEmpty({ message: 'El plan alimenticio es requerido' })
  @MaxLength(50, { message: 'El nombre del plan es demasiado largo' })
  planAlimenticio!: MealPlan; 
}