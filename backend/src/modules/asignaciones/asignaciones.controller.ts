import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AsignacionesService } from './asignaciones.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import type { AuthenticatedRequest } from 'src/common/types/authenticated-request.type';
import { UnauthorizedException } from '@nestjs/common';

@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) // Solo el admin ejecuta esta acción
  @Post()
  crearAsignacion(
    @Body('idSolicitud') idSolicitud: number,
    @Body('idHabitacion') idHabitacion: number,
    @Req() request: AuthenticatedRequest
  ) {
    // Extraemos el RUT del administrador directamente del Token JWT
    const rutAdmin = request.user?.rut;

    if (!rutAdmin) {
      throw new UnauthorizedException('No se pudo obtener el RUT del administrador');
    }

    return this.asignacionesService.crearAsignacion(idSolicitud, idHabitacion, rutAdmin);
  }
}