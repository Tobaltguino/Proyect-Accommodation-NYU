import { PartialType } from '@nestjs/mapped-types';
import { CreateHabitacioneDto } from './create-habitacione.dto';

export class UpdateHabitacioneDto extends PartialType(CreateHabitacioneDto) {}
