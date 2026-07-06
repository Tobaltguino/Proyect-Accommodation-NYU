import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  Body,
  Req,
  BadRequestException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

import { SolicitudesAdminService } from './solicitudes-admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateSolicitudesAdminDto } from './dto/update-solicitudes-admin.dto';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';

@ApiTags('Gestión de Solicitudes (Administrador)')
@ApiBearerAuth() // Activa el candado de seguridad en Swagger para todo el controlador
@Controller('solicitudes-admin')
export class SolicitudesAdminController {
  constructor(
    private readonly solicitudesAdminService: SolicitudesAdminService,
  ) { }

  @ApiOperation({ summary: 'Obtener todas las solicitudes correspondientes a un periodo académico específico' })
  @ApiParam({ name: 'idPeriodo', description: 'ID numérico del periodo académico' })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes filtrada por periodo.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('periodos/:idPeriodo')
  async obtenerSolicitudAdmin(
    @Param('idPeriodo', ParseIntPipe) idPeriodo: number,
  ) {
    return this.solicitudesAdminService.obtenerPorPeriodo(idPeriodo);
  }

  @ApiOperation({ summary: 'Obtener el registro histórico completo de todas las solicitudes' })
  @ApiResponse({ status: 200, description: 'Lista completa de solicitudes retornada exitosamente.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('')
  async obtenerTodasSolicitudAdmin() {
    return this.solicitudesAdminService.obtenerTodas();
  }

  @ApiOperation({
    summary: 'Actualizar el estado de una solicitud (Aprobar, Rechazar, etc.)',
    description: 'Cambia el estado de la solicitud y deja un registro automático del administrador que realizó la acción basado en el token JWT.'
  })
  @ApiParam({ name: 'idSolicitud', description: 'ID numérico de la solicitud a evaluar' })
  @ApiBody({
    type: UpdateSolicitudesAdminDto,
    description: 'Objeto con el nuevo estado de la solicitud',
    schema: { example: { estado: 'Aprobada' } } // Añadimos un ejemplo rápido para Angular
  })
  @ApiResponse({ status: 200, description: 'Estado de la solicitud actualizado correctamente.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':idSolicitud') // Corregida la ruta para evitar duplicación del prefijo
  async cambiarEstadoSolicitudAdmin(
    @Param('idSolicitud', ParseIntPipe) idSolicitud: number,
    @Body() dto: UpdateSolicitudesAdminDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!req.user) throw new BadRequestException('No se pudo obtener el usuario');

    const rutAdmin = req.user.rut;
    if (!rutAdmin) throw new BadRequestException('No se pudo obtener el RUT del administrador');

    return this.solicitudesAdminService.cambioEstadoYAdminSolicitud(
      idSolicitud,
      dto,
      rutAdmin,
    );
  }
}