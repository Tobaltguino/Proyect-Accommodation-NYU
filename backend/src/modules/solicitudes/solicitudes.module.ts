import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodosModule } from '../periodos/periodos.module'; // <-- IMPORTANTE: Traemos el módulo vecino
import { AsignacionEntity } from '../asignaciones/entities/asignacion.entity';
import { SolicitudEntity } from './entities/solicitud.entity'; // Tu entidad de solicitudes
import { SolicitudesController } from './solicitudes.controller';
import { SolicitudesService } from './solicitudes.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudEntity, AsignacionEntity]),
    AuthModule,
    PeriodosModule,
  ],
  controllers: [SolicitudesController],
  providers: [SolicitudesService],
  exports: [SolicitudesService],
})
export class SolicitudesModule {}
