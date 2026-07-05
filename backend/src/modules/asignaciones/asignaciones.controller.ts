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
  BadRequestException,
  Delete
} from '@nestjs/common';
import { AsignacionesService } from './asignaciones.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';

//api
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

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

  // GET http://localhost:3000/asignaciones/historial
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT) // Protegido para que el estudiante acceda a su propia información
  @Get('historial')
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

  // GET http://localhost:3000/asignaciones/activa
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT) // Solo el estudiante puede preguntar por SU asignación
  @Get('activa')
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

  // GET http://localhost:3000/asignaciones/estudiantes/:rut/activa
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('estudiantes/:rut/activa')
  obtenerAsignacionActivaPorRut(@Param('rut') rut: string) {
    return this.asignacionesService.obtenerAsignacionActivaPorRut(rut);
  }

  // GET http://localhost:3000/asignaciones/periodos/:idPeriodo
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('periodos/:idPeriodo')
  obtenerPorPeriodo(@Param('idPeriodo', ParseIntPipe) idPeriodo: number) {
    return this.asignacionesService.obtenerPorPeriodo(idPeriodo);
  }

  // GET http://localhost:3000/asignaciones/periodos/:idPeriodo/residentes/activos
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('periodos/:idPeriodo/residentes/activos')
  obtenerTotalResidentesActivos(
    @Param('idPeriodo', ParseIntPipe) idPeriodo: number,
  ) {
    return this.asignacionesService.obtenerTotalResidentesActivos(idPeriodo);
  }

  // PATCH http://localhost:3000/asignaciones/:idAsignacion/habitacion
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':idAsignacion/habitacion')
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

  // PATCH http://localhost:3000/asignaciones/:idAsignacion
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':idAsignacion') //comprobar
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

  // GET http://localhost:3000/asignaciones/residentes/:rut
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('residentes/:rut')
  buscarResidentePorRut(@Param('rut') rut: string) {
    if (!rut) {
      throw new BadRequestException('Debes proporcionar el RUT del estudiante.');
    }
    return this.asignacionesService.obtenerMiAsignacion(rut);
  }

  // PATCH http://localhost:3000/asignaciones/:idAsignacion/ingresos
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':idAsignacion/ingresos')
  registrarCheckIn(
    @Param('idAsignacion', ParseIntPipe) idAsignacion: number,
    @Req() request: AuthenticatedRequest
  ) {
    const rutAdmin = request.user?.rut;
    if (!rutAdmin) throw new UnauthorizedException('No se pudo obtener el RUT del administrador');

    return this.asignacionesService.registrarCheckIn(idAsignacion, rutAdmin);
  }

  // PATCH http://localhost:3000/asignaciones/:idAsignacion/salidas
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':idAsignacion/salidas')
  registrarCheckOut(
    @Param('idAsignacion', ParseIntPipe) idAsignacion: number,
    @Req() request: AuthenticatedRequest
  ) {
    const rutAdmin = request.user?.rut;
    if (!rutAdmin) throw new UnauthorizedException('No se pudo obtener el RUT del administrador');

    return this.asignacionesService.registrarCheckOut(idAsignacion, rutAdmin);
  }

  // GET http://localhost:3000/asignaciones/estudiantes/12345678-9/estado
  @UseGuards(ApiKeyGuard)
  @Get('estudiantes/:rut/estado')
  obtenerEstadoResidencia(@Param('rut') rut: string): Promise<boolean> {
    return this.asignacionesService.obtenerEstadoResidencia(rut);
  }



}
