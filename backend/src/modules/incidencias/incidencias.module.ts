import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidenciasController } from './incidencias.controller';
import { IncidenciasService } from './incidencias.service';
import { PeriodoEntity } from '../solicitudes/entities';
import { IncidenciaEstanciaEntity } from './entities';
import { AsignacionEntity } from '../asignaciones/entities/asignacion.entity';
import { HabitacionEntity } from '../residencias/entities';
import { UsuarioEntity } from '../users/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IncidenciaEstanciaEntity,
      PeriodoEntity,
      HabitacionEntity,
      UsuarioEntity,
      AsignacionEntity,
    ]),
  ],
  controllers: [IncidenciasController],
  providers: [IncidenciasService],
})
export class IncidenciasModule {}
