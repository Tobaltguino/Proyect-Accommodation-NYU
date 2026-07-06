import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../auth/enums/role.enum';
import { IncidenciasService } from './incidencias.service';
import { CreateIncidenciaDto, IncidenciaQueryDto } from './dto';

@ApiTags('Gestión de Incidencias')
@Controller('incidencias')
export class IncidenciasController {
  constructor(private readonly incidenciasService: IncidenciasService) { }

  // ==========================================
  // RUTAS PÚBLICAS
  // ==========================================

  @ApiOperation({
    summary: 'Verificar el estado del servicio de incidencias (Health Check)',
    description: 'Endpoint público para comprobar si el módulo responde correctamente.'
  })
  @ApiResponse({ status: 200, description: 'Servicio en línea.' })
  @Get('status')
  status() {
    return this.incidenciasService.getStatus();
  }

  // ==========================================
  // RUTAS PROTEGIDAS
  // ==========================================

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Registrar una nueva incidencia en el sistema',
    description: 'Crea un reporte de incidencia. Nota: Actualmente restringido a administradores.'
  })
  @ApiResponse({ status: 201, description: 'Incidencia creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en los datos enviados (Validación del DTO).' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) // ⚠️ CAMBIAR A Role.STUDENT si el frontend del alumno es quien dispara esto
  @Post()
  create(@Body() body: CreateIncidenciaDto) {
    return this.incidenciasService.createIncidencia(body);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener el listado de incidencias con filtros opcionales',
    description: 'Permite buscar y filtrar las incidencias reportadas usando query parameters (?estado=Pendiente).'
  })
  @ApiResponse({ status: 200, description: 'Lista de incidencias retornada exitosamente.' })
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔒 PARCHE DE SEGURIDAD APLICADO AQUÍ
  @Roles(Role.ADMIN)                   // 🔒 PARCHE DE SEGURIDAD APLICADO AQUÍ
  @Get()
  findAll(@Query() query: IncidenciaQueryDto) {
    return this.incidenciasService.getIncidencias(query);
  }
}