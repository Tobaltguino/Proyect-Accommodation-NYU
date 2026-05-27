import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';
import { AsignacionEstanciaEntity } from '../solicitudes/entities';

@Module({
  imports : [TypeOrmModule.forFeature([AsignacionEstanciaEntity])],
  controllers: [CheckinController],
  providers: [CheckinService],
})
export class CheckinModule {}
