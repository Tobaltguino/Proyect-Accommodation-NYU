import {
  Patch,
  UseGuards,
  Body,
  Req
} from '@nestjs/common';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SolicitudesAdminService } from './solicitudes-admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { get } from 'http';
import { UpdateSolicitudesAdminDto } from './dto/update-solicitudes-admin.dto';

@Controller('solicitudes-admin')
export class SolicitudesAdminController {
  constructor(private readonly solicitudesAdminService: SolicitudesAdminService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('periodo/:idPeriodo')
  async obtenerSolicitudAdmin(@Param('idPeriodo', ParseIntPipe) idPeriodo: number) {
    return this.solicitudesAdminService.obtenerPorPeriodo(idPeriodo);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('todas')
  async obtenerTodasSolicitudAdmin() {
    return this.solicitudesAdminService.obtenerTodas();
  }

  //ELIMINAR
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('idSolicitud/:idSolicitud')
  async cambiarEstadoSolicitudAdmin(@Param('idSolicitud', ParseIntPipe) idSolicitud: number, @Body() dto: UpdateSolicitudesAdminDto, @Req() req: any) {
    const rutAdmin = req.user.rut;
    return this.solicitudesAdminService.cambioEstadoYAdminSolicitud(idSolicitud, dto, rutAdmin);
  }
}