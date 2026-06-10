import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitacionesService } from './habitaciones.service';
import { HabitacionesController } from './habitaciones.controller';
import { HabitacionEntity } from '../residencias/entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HabitacionEntity]),
    AuthModule
  ],
  controllers: [HabitacionesController],
  providers: [HabitacionesService],
})
export class HabitacionesModule { }
