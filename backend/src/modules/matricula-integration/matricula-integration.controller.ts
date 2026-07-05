import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MatriculaIntegrationService } from './matricula-integration.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('matricula')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatriculaIntegrationController {
  constructor(private readonly service: MatriculaIntegrationService) {}

  @Roles(Role.ADMIN)
  @Get('verificar/:rut')
  async verificar(@Param('rut') rut: string) {
    const esActivo = await this.service.verificarMatricula(rut);
    return { esActivo };
  }
}