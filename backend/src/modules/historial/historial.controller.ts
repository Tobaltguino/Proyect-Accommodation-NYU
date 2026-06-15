import {
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { HistorialService } from './historial.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import type { AuthenticatedRequest } from 'src/common/types/authenticated-request.type';

@Controller('historial')
export class HistorialController {
  constructor(private readonly historialService: HistorialService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  obtenerHistorialAdmin(
    @Query('rutEstudiante') rutEstudiante?: string,
    @Query('tipoMovimiento') tipoMovimiento?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.historialService.obtenerHistorialAdmin({
      rutEstudiante,
      tipoMovimiento,
      fechaDesde,
      fechaHasta,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Get('mi-historial')
  obtenerMiHistorial(@Req() request: AuthenticatedRequest) {
    const rutEstudiante = request.user?.rut;

    if (!rutEstudiante) {
      throw new UnauthorizedException(
        'No se pudo obtener el RUT del estudiante',
      );
    }

    return this.historialService.obtenerMiHistorial(rutEstudiante);
  }
}
