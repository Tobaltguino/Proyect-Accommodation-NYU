import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodosService } from './periodos.service';
import { PeriodosController } from './periodos.controller';
import { PeriodoEntity } from '../solicitudes/entities';

@Module({
  imports: [TypeOrmModule.forFeature([PeriodoEntity])],
  controllers: [PeriodosController],
  providers: [PeriodosService],
  exports: [PeriodosService],
})
export class PeriodosModule { }
