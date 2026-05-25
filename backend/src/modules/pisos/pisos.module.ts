import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PisosService } from './pisos.service';
import { PisosController } from './pisos.controller';
import { PisoEntity } from '../residencias/entities';

@Module({
  imports: [TypeOrmModule.forFeature([PisoEntity])],
  controllers: [PisosController],
  providers: [PisosService],
})
export class PisosModule { }
