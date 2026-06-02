import { Module } from '@nestjs/common';
import { PlanAlimenticioService } from './plan-alimenticio.service';
import { PlanAlimenticioController } from './plan-alimenticio.controller';

@Module({
  providers: [PlanAlimenticioService],
  controllers: [PlanAlimenticioController]
})
export class PlanAlimenticioModule {}
