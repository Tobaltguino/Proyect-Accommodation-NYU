import {
  Controller,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

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
  ) {
    if (!fecha) {
      throw new Error('Debes proporcionar la "fecha" en el body.');
    }

    return this.checkinService.registrarCheckIn(idAsignacion, fecha);
  }
}
