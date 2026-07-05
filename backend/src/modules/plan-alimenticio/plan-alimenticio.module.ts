import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanAlimenticioService } from './plan-alimenticio.service';
import { PlanAlimenticioController } from './plan-alimenticio.controller';
import { AuthModule } from '../auth/auth.module';
import { PlanAlimenticioEntity } from '../solicitudes/entities';
@Module({
  imports: [TypeOrmModule.forFeature([PlanAlimenticioEntity]), AuthModule],
  controllers: [PlanAlimenticioController],
  providers: [PlanAlimenticioService],
})
export class PlanAlimenticioModule {}
