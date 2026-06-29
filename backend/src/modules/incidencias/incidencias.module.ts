import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidenciasController } from './incidencias.controller';
import { IncidenciasService } from './incidencias.service';
import { AuthModule } from '../auth/auth.module';
import { PeriodoEntity } from '../solicitudes/entities';
import { IncidenciaEstanciaEntity } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([IncidenciaEstanciaEntity, PeriodoEntity]),
    AuthModule,
  ],
  controllers: [IncidenciasController],
  providers: [IncidenciasService],
})
export class IncidenciasModule {}
