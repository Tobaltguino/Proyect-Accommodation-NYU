import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ResidenciasModule } from '../residencias/residencias.module';
import {
  AsignacionEstanciaEntity,
  PeriodoEntity,
  PlanAlimenticioEntity,
  SolicitudEntity,
} from './entities';
import { SolicitudesController } from './solicitudes.controller';
import { SolicitudesService } from './solicitudes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SolicitudEntity,
      PeriodoEntity,
      AsignacionEstanciaEntity,
      PlanAlimenticioEntity,
    ]),
    ResidenciasModule,
    AuthModule,
  ],
  controllers: [SolicitudesController],
  providers: [SolicitudesService],
})
export class SolicitudesModule {}
