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
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { AsignacionesService } from './asignaciones.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';

import { CrearAsignacionDTO } from './dto/crearAsignacion.dto';

@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) { }

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

  // FASE 1: Ruta POST para iniciar el pago (Orientada a recursos)
  @Post(':idAsignacion/pagos')
  async iniciarPago(
    @Param('idAsignacion', ParseIntPipe) idAsignacion: number,
    @Req() request: any // Usa tu AuthenticatedRequest aquí
  ) {
    const rutEstudiante = request.user.rut; // Extraído del token JWT
    return this.asignacionesService.prepararOrdenPago(idAsignacion, rutEstudiante);
  }

  // FASE 3: Ruta GET para verificar cómo quedó el pago
  @Get(':idAsignacion/pagos')
  async verificarPago(
    @Param('idAsignacion', ParseIntPipe) idAsignacion: number,
    @Req() request: any
  ) {
    const rutEstudiante = request.user.rut;
    return this.asignacionesService.verificarYConfirmarPago(idAsignacion, rutEstudiante);
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

  // ==========================================
  // NUEVAS RUTAS: BÚSQUEDA Y CONTROL DE ESTANCIA
  // ==========================================

  // GET http://localhost:3000/asignaciones/buscar-residente/12345678-9
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('buscar-residente/:rut')
  buscarResidentePorRut(@Param('rut') rut: string) {
    if (!rut) {
      throw new BadRequestException('Debes proporcionar el RUT del estudiante.');
    }
    return this.asignacionesService.obtenerMiAsignacion(rut);
  }

  // PATCH http://localhost:3000/asignaciones/1/check-in
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':idAsignacion/check-in')
  registrarCheckIn(
    @Param('idAsignacion', ParseIntPipe) idAsignacion: number,
    @Req() request: AuthenticatedRequest
  ) {
    const rutAdmin = request.user?.rut;
    if (!rutAdmin) throw new UnauthorizedException('No se pudo obtener el RUT del administrador');

    return this.asignacionesService.registrarCheckIn(idAsignacion, rutAdmin);
  }

  // PATCH http://localhost:3000/asignaciones/1/check-out
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':idAsignacion/check-out')
  registrarCheckOut(
    @Param('idAsignacion', ParseIntPipe) idAsignacion: number,
    @Req() request: AuthenticatedRequest
  ) {
    const rutAdmin = request.user?.rut;
    if (!rutAdmin) throw new UnauthorizedException('No se pudo obtener el RUT del administrador');

    return this.asignacionesService.registrarCheckOut(idAsignacion, rutAdmin);
  }
}
