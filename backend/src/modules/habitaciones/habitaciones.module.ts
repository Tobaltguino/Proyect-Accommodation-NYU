import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitacionesService } from './habitaciones.service';
import { HabitacionesController } from './habitaciones.controller';
import { HabitacionEntity } from '../residencias/entities';

@Module({
  imports: [TypeOrmModule.forFeature([HabitacionEntity])],
  controllers: [HabitacionesController],
  providers: [HabitacionesService],
})
export class HabitacionesModule { }
