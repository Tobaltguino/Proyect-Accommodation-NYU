import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudesAdminService } from './solicitudes-admin.service';
import { SolicitudesAdminController } from './solicitudes-admin.controller';
// Importamos la entidad que ya tenías creada
import { SolicitudEntity } from '../solicitudes/entities';

@Module({
  imports: [TypeOrmModule.forFeature([SolicitudEntity])],
  controllers: [SolicitudesAdminController],
  providers: [SolicitudesAdminService],
})
export class SolicitudesAdminModule {}