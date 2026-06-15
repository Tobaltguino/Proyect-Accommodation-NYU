import {
  Controller,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import type { AuthenticatedRequest } from 'src/common/types/authenticated-request.type';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('checkin')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  // PATCH http://localhost:3000/checkin/1
  @Patch(':idAsignacion')
  registrarCheckIn(
    @Param('idAsignacion', ParseIntPipe) idAsignacion: number,
    @Body('fecha') fecha: string,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!fecha) {
      throw new BadRequestException(
        'Debes proporcionar la "fecha" en el body.',
      );
    }

    const rutAdmin = request.user?.rut;

    if (!rutAdmin) {
      throw new BadRequestException(
        'No se pudo obtener el RUT del administrador.',
      );
    }

    return this.checkinService.registrarCheckIn(idAsignacion, fecha, rutAdmin);
  }
}
