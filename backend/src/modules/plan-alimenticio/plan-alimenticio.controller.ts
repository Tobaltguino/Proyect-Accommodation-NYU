import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { PlanAlimenticioService } from './plan-alimenticio.service';

@Controller('plan-alimenticio')
export class PlanAlimenticioController {
  constructor(
    private readonly PlanAlimenticioService: PlanAlimenticioService,
  ) {}

  @Get('todos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async obtenerTodasPlanesAdmin() {
    return this.PlanAlimenticioService.obtenerTodas();
  }
}
