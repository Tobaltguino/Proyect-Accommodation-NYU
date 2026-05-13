import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodosService } from './periodos.service';
import { PeriodosController } from './periodos.controller';
import { PeriodoEntity } from './entities/periodo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PeriodoEntity])],
  controllers: [PeriodosController],
  providers: [PeriodosService],
})
export class PeriodosModule {}
