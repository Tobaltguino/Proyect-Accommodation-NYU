import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../auth/enums/role.enum';
import { AvailabilityQueryDto } from './dto';
import { ResidenciasService } from './residencias.service';

@Controller('residencias')
export class ResidenciasController {
  constructor(private readonly residenciasService: ResidenciasService) {}

  @Get('status')
  status() {
    return this.residenciasService.getStatus();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Get('disponibilidad')
  disponibilidad(@Query() query: AvailabilityQueryDto) {
    return this.residenciasService.getAvailability(
      query.gender,
      query.semester,
    );
  }
}
