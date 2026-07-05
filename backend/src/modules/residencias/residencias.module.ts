import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import {
  AsignacionEstanciaEntity,
  PeriodoEntity,
  SolicitudEntity,
} from '../solicitudes/entities';
import { EdificioEntity, HabitacionEntity, PisoEntity } from './entities';
import { ResidenciasController } from './residencias.controller';
import { ResidenciasService } from './residencias.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HabitacionEntity,
      PisoEntity,
      EdificioEntity,
      SolicitudEntity,
      AsignacionEstanciaEntity,
      PeriodoEntity,
    ]),
    AuthModule,
  ],
  controllers: [ResidenciasController],
  providers: [ResidenciasService],
  exports: [ResidenciasService],
})
export class ResidenciasModule {}
