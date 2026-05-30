import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EdificiosService } from './edificios.service';
import { EdificiosController } from './edificios.controller';
import { EdificioEntity } from '../residencias/entities';

@Module({
  imports: [TypeOrmModule.forFeature([EdificioEntity])],
  controllers: [EdificiosController],
  providers: [EdificiosService],
})
export class EdificiosModule { }
