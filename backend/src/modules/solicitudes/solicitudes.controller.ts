import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../auth/enums/role.enum';
import { SolicitudesService } from './solicitudes.service';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';

@ApiTags('Gestión de Solicitudes (Estudiantes)')
@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) { }

  // ==========================================
  // RUTAS PÚBLICAS
  // ==========================================

  @ApiOperation({
    summary: 'Verificar el estado del servicio de solicitudes (Health Check)',
    description: 'Endpoint público para monitorear si el módulo está en línea.'
  })
  @ApiResponse({ status: 200, description: 'Servicio funcionando correctamente.' })
  @Get('status')
  status() {
    return this.solicitudesService.getStatus();
  }

  // ==========================================
  // RUTAS DEL ESTUDIANTE
  // ==========================================

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener el historial de todas las solicitudes del estudiante logueado',
    description: 'Retorna una lista con todas las solicitudes de residencia que el estudiante ha hecho históricamente.'
  })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes obtenida exitosamente.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Get()
  async getAll(@Req() request: AuthenticatedRequest) {
    if (!request.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return this.solicitudesService.getAllMySolicitudes(request.user);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener la solicitud actual/vigente del estudiante logueado',
    description: 'Retorna únicamente la solicitud más reciente o en proceso que pertenece al estudiante.'
  })
  @ApiResponse({ status: 200, description: 'Detalle de la solicitud retornado.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Get('me')
  async getMine(@Req() request: AuthenticatedRequest) {
    if (!request.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return this.solicitudesService.getMySolicitud(request.user);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear una nueva solicitud de residencia',
    description: 'Permite al estudiante enviar una nueva solicitud para postular a una vacante en la residencia.'
  })
  @ApiBody({
    description: 'Datos necesarios para la solicitud (NOTA: Reemplazar por un DTO en el futuro)',
    schema: {
      example: {
        motivo: 'Renovación de beca',
        distanciaKm: 45
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Solicitud creada e ingresada al sistema con éxito.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Post()
  async create(@Req() request: AuthenticatedRequest, @Body() body: any) {
    if (!request.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return this.solicitudesService.createSolicitud(request.user, body);
  }
}