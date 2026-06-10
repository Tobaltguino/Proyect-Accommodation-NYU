import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudesAdminService } from './solicitudes-admin.service';
import { SolicitudesAdminController } from './solicitudes-admin.controller';
import { AuthModule } from '../auth/auth.module';
import { SolicitudEntity } from '../solicitudes/entities';

@Module({
  imports: [TypeOrmModule.forFeature([SolicitudEntity]),AuthModule],
  controllers: [SolicitudesAdminController],
  providers: [SolicitudesAdminService],
})
export class SolicitudesAdminModule {}