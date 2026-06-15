import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';
import { AuthModule } from '../auth/auth.module';
import { AsignacionEntity } from '../asignaciones/entities/asignacion.entity';
import { HistorialModule } from '../historial/historial.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AsignacionEntity]),
    AuthModule,
    HistorialModule,
  ],
  controllers: [CheckinController],
  providers: [CheckinService],
})
export class CheckinModule {}
