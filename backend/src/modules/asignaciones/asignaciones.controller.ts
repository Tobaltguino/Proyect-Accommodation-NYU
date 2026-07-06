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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiSecurity } from '@nestjs/swagger';

import { AsignacionesService } from './asignaciones.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';
import { PagosService } from '../pagos/pagos.service';
import { ConfirmarPagoDTO } from '../pagos/dto/pagos.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CrearAsignacionDTO } from './dto/crearAsignacion.dto';

@ApiTags('Asignaciones y Gestión de Estancias')
@ApiBearerAuth() // Indica que (casi) todas las rutas de este controlador requieren Token JWT
@Controller('asignaciones')
export class AsignacionesController {
  constructor(
    private readonly asignacionesService: AsignacionesService,
    private readonly pagosService: PagosService,
  ) { }

  // ==========================================
  // RUTAS ADMINISTRATIVAS - GESTIÓN PRINCIPAL
  // ==========================================

  @ApiOperation({ summary: 'Crear una nueva asignación de residencia' })
  @ApiResponse({ status: 201, description: 'Asignación creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Conflicto de género o habitación sin capacidad.' })
  @ApiResponse({ status: 404, description: 'Solicitud, habitación, piso o edificio no encontrado.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  crearAsignacion(
    @Body() payload: CrearAsignacionDTO,
    @Req() request: AuthenticatedRequest,
  ) {
    const rutAdmin = request.user?.rut;
    if (!rutAdmin) throw new UnauthorizedException('No se pudo obtener el RUT del administrador');

    return this.asignacionesService.crearAsignacion(payload.idSolicitud, payload.idHabitacion, rutAdmin);
  }

  @ApiOperation({ summary: 'Obtener todas las asignaciones históricas y vigentes' })
  @ApiResponse({ status: 200, description: 'Lista completa de asignaciones retornada.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  obtenerTodas() {
    return this.asignacionesService.obtenerTodas();
  }

  @ApiOperation({ summary: 'Obtener la asignación activa de un estudiante por su RUT' })
  @ApiParam({ name: 'rut', description: 'RUT del estudiante (con o sin puntos/guion)' })
  @ApiResponse({ status: 200, description: 'Detalle de la asignación activa retornada.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('estudiantes/:rut/activa')
  obtenerAsignacionActivaPorRut(@Param('rut') rut: string) {
    return this.asignacionesService.obtenerAsignacionActivaPorRut(rut);
  }

  @ApiOperation({ summary: 'Buscar el historial o estado de un residente por RUT' })
  @ApiParam({ name: 'rut', description: 'RUT del estudiante a buscar' })
  @ApiResponse({ status: 200, description: 'Información del residente encontrada.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('residentes/:rut')
  buscarResidentePorRut(@Param('rut') rut: string) {
    if (!rut) throw new BadRequestException('Debes proporcionar el RUT del estudiante.');
    return this.asignacionesService.obtenerMiAsignacion(rut);
  }

  // ==========================================
  // RUTAS ADMINISTRATIVAS - PERIODOS Y ESTADÍSTICAS
  // ==========================================

  @ApiOperation({ summary: 'Obtener todas las asignaciones filtradas por periodo académico' })
  @ApiParam({ name: 'idPeriodo', description: 'ID del periodo académico' })
  @ApiResponse({ status: 200, description: 'Lista de asignaciones del periodo.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('periodos/:idPeriodo')
  obtenerPorPeriodo(@Param('idPeriodo', ParseIntPipe) idPeriodo: number) {
    return this.asignacionesService.obtenerPorPeriodo(idPeriodo);
  }

  @ApiOperation({ summary: 'Obtener la cantidad total de residentes con estadía activa en un periodo' })
  @ApiParam({ name: 'idPeriodo', description: 'ID del periodo académico' })
  @ApiResponse({ status: 200, description: 'Retorna un objeto con el total numérico de residentes.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('periodos/:idPeriodo/residentes/activos')
  obtenerTotalResidentesActivos(@Param('idPeriodo', ParseIntPipe) idPeriodo: number) {
    return this.asignacionesService.obtenerTotalResidentesActivos(idPeriodo);
  }

  // ==========================================
  // RUTAS ADMINISTRATIVAS - LOGÍSTICA DE HABITACIÓN
  // ==========================================

  @ApiOperation({ summary: 'Reasignar a un estudiante a una habitación diferente' })
  @ApiParam({ name: 'idAsignacion', description: 'ID de la asignación vigente' })
  @ApiBody({ schema: { example: { idNuevaHabitacion: 5 } } })
  @ApiResponse({ status: 200, description: 'Estudiante reasignado correctamente.' })
  @ApiResponse({ status: 400, description: 'Conflicto de género o falta de capacidad en la nueva habitación.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':idAsignacion/habitacion')
  reasignarHabitacion(
    @Param('idAsignacion', ParseIntPipe) idAsignacion: number,
    @Body('idNuevaHabitacion', ParseIntPipe) idNuevaHabitacion: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const rutAdmin = request.user?.rut;
    if (!rutAdmin) throw new UnauthorizedException('No se pudo obtener el RUT del administrador');
    if (!idNuevaHabitacion) throw new BadRequestException('Debes enviar el idNuevaHabitacion en el body.');

    return this.asignacionesService.reasignarHabitacion(idAsignacion, idNuevaHabitacion, rutAdmin);
  }

  @ApiOperation({ summary: 'Registrar la entrada (Check-In) del estudiante a la residencia' })
  @ApiParam({ name: 'idAsignacion', description: 'ID de la asignación' })
  @ApiResponse({ status: 200, description: 'Check-In registrado con la fecha actual.' })
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

  @ApiOperation({ summary: 'Registrar la salida definitiva (Check-Out) del estudiante y liberar su cama' })
  @ApiParam({ name: 'idAsignacion', description: 'ID de la asignación' })
  @ApiResponse({ status: 200, description: 'Check-Out registrado y disponibilidad de habitación actualizada.' })
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

  @ApiOperation({ summary: 'Procesar la renuncia de una asignación vigente y liberar la cama' })
  @ApiParam({ name: 'idAsignacion', description: 'ID de la asignación' })
  @ApiResponse({ status: 200, description: 'Renuncia procesada y habitación liberada.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':idAsignacion')
  renunciarAsignacion(
    @Param('idAsignacion', ParseIntPipe) idAsignacion: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const rutAdmin = request.user?.rut;
    if (!rutAdmin) throw new UnauthorizedException('No se pudo obtener el RUT del administrador');
    return this.asignacionesService.renunciarAsignacion(idAsignacion, rutAdmin);
  }

  // ==========================================
  // RUTAS DEL ESTUDIANTE (VISTAS Y PAGOS)
  // ==========================================

  @ApiOperation({ summary: 'Obtener el historial completo de estancias del estudiante logueado' })
  @ApiResponse({ status: 200, description: 'Lista de asignaciones pasadas y actuales.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Get('historial')
  obtenerMiHistorial(@Req() request: AuthenticatedRequest) {
    const rutEstudiante = request.user?.rut;
    if (!rutEstudiante) throw new UnauthorizedException('No se pudo obtener el RUT del estudiante');
    return this.asignacionesService.obtenerMiHistorial(rutEstudiante);
  }

  @ApiOperation({ summary: 'Obtener la asignación actualmente activa del estudiante logueado' })
  @ApiResponse({ status: 200, description: 'Detalles de la habitación, piso y edificio actual.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Get('activa')
  obtenerMiAsignacion(@Req() request: AuthenticatedRequest) {
    const rutEstudiante = request.user?.rut;
    if (!rutEstudiante) throw new UnauthorizedException('No se pudo obtener el RUT del estudiante');
    return this.asignacionesService.obtenerMiAsignacion(rutEstudiante);
  }

  @ApiOperation({ summary: 'Inicia el proceso de pago en la pasarela externa (Obtiene URL de redirección)' })
  @ApiParam({ name: 'idAsignacion', description: 'ID de la asignación a pagar' })
  @ApiResponse({ status: 201, description: 'Orden creada en Finanzas, retorna datos y link de pago.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Post(':idAsignacion/pagos')
  iniciarProcesoPago(@Param('idAsignacion', ParseIntPipe) idAsignacion: number) {
    return this.pagosService.crearOrdenDePago(
      idAsignacion,
      500,
      `Pago matrícula semestre 1 2026 - Asignación ${idAsignacion}`
    );
  }

  @ApiOperation({ summary: 'Consulta el sistema de Finanzas y sincroniza el estado de la orden de pago local' })
  @ApiParam({ name: 'idAsignacion', description: 'ID de la asignación' })
  @ApiResponse({ status: 200, description: 'Estado local actualizado (Pagada, Rechazada, Pendiente).' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Patch(':idAsignacion/pagos/estado')
  sincronizarEstadoPago(@Param('idAsignacion', ParseIntPipe) idAsignacion: number) {
    return this.pagosService.sincronizarPago(idAsignacion);
  }

  // ==========================================
  // RUTAS DE INTEGRACIÓN ENTRE SISTEMAS (MÁQUINA A MÁQUINA)
  // ==========================================

  @ApiOperation({ summary: 'Consulta de sistema a sistema para saber si un estudiante es residente activo' })
  @ApiParam({ name: 'rut', description: 'RUT del estudiante' })
  @ApiSecurity('api_key') // Cambia el candado visual de JWT a API Key en la interfaz de Swagger
  @ApiResponse({ status: 200, description: 'Retorna un booleano (true/false) sobre la residencia en el periodo actual.' })
  @UseGuards(ApiKeyGuard)
  @Get('estudiantes/:rut/estado')
  obtenerEstadoResidencia(@Param('rut') rut: string): Promise<boolean> {
    return this.asignacionesService.obtenerEstadoResidencia(rut);
  }
}