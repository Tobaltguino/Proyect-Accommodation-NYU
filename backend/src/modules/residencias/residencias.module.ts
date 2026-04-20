import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { SolicitudEntity } from '../solicitudes/entities';
import { HabitacionEntity } from './entities';
import { ResidenciasController } from './residencias.controller';
import { ResidenciasService } from './residencias.service';

@Module({
  imports: [TypeOrmModule.forFeature([HabitacionEntity, SolicitudEntity]), AuthModule],
  controllers: [ResidenciasController],
  providers: [ResidenciasService],
  exports: [ResidenciasService],
})
export class ResidenciasModule {}
