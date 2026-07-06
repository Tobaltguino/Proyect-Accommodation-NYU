import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionEntity } from '../asignaciones/entities/asignacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AsignacionEntity,
    ]),
  ],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule { }
