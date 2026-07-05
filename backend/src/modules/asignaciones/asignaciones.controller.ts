import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { AsignacionesService } from './asignaciones.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';
import { UnauthorizedException } from '@nestjs/common';

///APIS
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

import { BadRequestException } from '@nestjs/common';
import { CrearAsignacionDTO } from './dto/crearAsignacion.dto';

@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) // Solo el admin ejecuta esta acción
  @Post()
  crearAsignacion(
    @Body() payload: CrearAsignacionDTO,
    @Req() request: AuthenticatedRequest,
  ) {
    const rutAdmin = request.user?.rut;

    if (!rutAdmin) {
      throw new UnauthorizedException(
        'No se pudo obtener el RUT del administrador',
      );
    }

    return this.asignacionesService.crearAsignacion(
      payload.idSolicitud,
      payload.idHabitacion,
      rutAdmin,
    );
  }

  // GET http://localhost:3000/asignaciones/mi-historial
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT) // Protegido para que el estudiante acceda a su propia información
  @Get('mi-historial')
  obtenerMiHistorial(@Req() request: AuthenticatedRequest) {
    // Extraemos de forma segura el RUT desde el token JWT cargado por el guardia
    const rutEstudiante = request.user?.rut;

    if (!rutEstudiante) {
      throw new UnauthorizedException(
        'No se pudo obtener el RUT del estudiante',
      );
    }

    return this.asignacionesService.obtenerMiHistorial(rutEstudiante);
  }

  // GET http://localhost:3000/asignaciones
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  obtenerTodas() {
    return this.asignacionesService.obtenerTodas();
  }

  // GET http://localhost:3000/asignaciones/mi-asignacion
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT) // Solo el estudiante puede preguntar por SU asignación
  @Get('mi-asignacion')
  obtenerMiAsignacion(@Req() request: AuthenticatedRequest) {
    // El guardia ya verificó el token, así que extraemos el RUT con total confianza
    const rutEstudiante = request.user?.rut;

    if (!rutEstudiante) {
      throw new UnauthorizedException(
        'No se pudo obtener el RUT del estudiante',
      );
    }

    return this.asignacionesService.obtenerMiAsignacion(rutEstudiante);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('estudiante/:rut/activa')
  obtenerAsignacionActivaPorRut(@Param('rut') rut: string) {
    return this.asignacionesService.obtenerAsignacionActivaPorRut(rut);
  }

  // GET http://localhost:3000/asignaciones/periodo/1
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('periodo/:idPeriodo')
  obtenerPorPeriodo(@Param('idPeriodo', ParseIntPipe) idPeriodo: number) {
    return this.asignacionesService.obtenerPorPeriodo(idPeriodo);
  }

  // GET http://localhost:3000/asignaciones/residentes-activos/1
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('residentes-activos/:idPeriodo')
  obtenerTotalResidentesActivos(
    @Param('idPeriodo', ParseIntPipe) idPeriodo: number,
  ) {
    return this.asignacionesService.obtenerTotalResidentesActivos(idPeriodo);
  }

  // PATCH http://localhost:3000/asignaciones/1/reasignar
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':idAsignacion/reasignar')
  reasignarHabitacion(
    @Param('idAsignacion', ParseIntPipe) idAsignacion: number,
    @Body('idNuevaHabitacion', ParseIntPipe) idNuevaHabitacion: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const rutAdmin = request.user?.rut;

    if (!rutAdmin) {
      throw new UnauthorizedException(
        'No se pudo obtener el RUT del administrador',
      );
    }

    if (!idNuevaHabitacion) {
      throw new BadRequestException(
        'Debes enviar el idNuevaHabitacion en el body.',
      );
    }

    return this.asignacionesService.reasignarHabitacion(
      idAsignacion,
      idNuevaHabitacion,
      rutAdmin,
    );
  }

  // PATCH http://localhost:3000/asignaciones/1/renunciar
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':idAsignacion/renunciar')
  renunciarAsignacion(
    @Param('idAsignacion', ParseIntPipe) idAsignacion: number,
    @Req() request: AuthenticatedRequest,
  ) {
    // Extraemos el RUT del administrador que está haciendo la operación
    const rutAdmin = request.user?.rut;

    if (!rutAdmin) {
      throw new UnauthorizedException(
        'No se pudo obtener el RUT del administrador',
      );
    }

    return this.asignacionesService.renunciarAsignacion(idAsignacion, rutAdmin);
  }

  // GET http://localhost:3000/asignaciones/verificar-residencia/:rut
  // Nota: No usamos @UseGuards ni @Roles aquí para que otros equipos puedan acceder
  @UseGuards(ApiKeyGuard)
  @Get('verificar-residencia/:rut')
  verificarResidenciaExterna(@Param('rut') rut: string): Promise<boolean> {
    return this.asignacionesService.verificarResidenciaActivaBooleano(rut);
  }
}
