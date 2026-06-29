import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PisosService } from './pisos.service';
import { PisosController } from './pisos.controller';
import { PisoEntity } from '../residencias/entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([PisoEntity]), AuthModule],
  controllers: [PisosController],
  providers: [PisosService],
})
export class PisosModule {}
