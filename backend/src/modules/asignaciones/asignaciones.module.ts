import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionesController } from './asignaciones.controller';
import { AsignacionesService } from './asignaciones.service';
import { AsignacionEntity } from './entities/asignacion.entity';

import { HabitacionEntity } from '../residencias/entities';
import { SolicitudEntity } from '../solicitudes/entities';
import { EdificioEntity } from '../residencias/entities';
import { PisoEntity } from '../residencias/entities';
import { AuthModule } from '../auth/auth.module';
import { PlanAlimenticioEntity } from '../solicitudes/entities';
import { PagosService } from '../pagos/pagos.service';
import { PagosModule } from '../pagos/pagos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AsignacionEntity,
      PlanAlimenticioEntity,
      HabitacionEntity,
      SolicitudEntity,
      EdificioEntity,
      PisoEntity,
    ]),
    AuthModule,
    PagosModule
  ],
  controllers: [AsignacionesController],
  providers: [AsignacionesService],
})
export class AsignacionesModule { }
