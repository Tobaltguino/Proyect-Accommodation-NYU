import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialController } from './historial.controller';
import { HistorialService } from './historial.service';
import { AuthModule } from '../auth/auth.module';
import { HistorialResidenciaEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialResidenciaEntity]), AuthModule],
  controllers: [HistorialController],
  providers: [HistorialService],
  exports: [HistorialService],
})
export class HistorialModule {}
