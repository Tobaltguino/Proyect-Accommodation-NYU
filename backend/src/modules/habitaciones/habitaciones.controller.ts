import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

import { HabitacionesService } from './habitaciones.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Gestión de Habitaciones')
@ApiBearerAuth() // Exige Token JWT en Swagger para todas las rutas
@Controller('habitaciones')
export class HabitacionesController {
  constructor(private readonly habitacionesService: HabitacionesService) { }

  // ==========================================
  // RUTAS ADMINISTRATIVAS - CREACIÓN Y LECTURA
  // ==========================================

  @ApiOperation({ summary: 'Crear una nueva habitación y asignarla a un piso' })
  @ApiBody({
    description: 'Parámetros obligatorios para registrar la habitación',
    schema: {
      example: {
        nroHabitacion: 101,
        capacidadActual: 2,
        disponibilidad: true,
        idPiso: 1
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Habitación creada y guardada exitosamente.' })
  @ApiResponse({ status: 404, description: 'El idPiso proporcionado no existe.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  crearHabitacion(
    @Body('nroHabitacion') nroHabitacion: number,
    @Body('capacidadActual') capacidadActual: number,
    @Body('disponibilidad') disponibilidad: boolean,
    @Body('idPiso') idPiso: number,
  ) {
    return this.habitacionesService.crearHabitacion(
      nroHabitacion,
      capacidadActual,
      disponibilidad,
      idPiso,
    );
  }

  @ApiOperation({ summary: 'Obtener el listado básico de todas las habitaciones del sistema' })
  @ApiResponse({ status: 200, description: 'Lista completa de habitaciones.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  obtenerTodas() {
    return this.habitacionesService.obtenerTodas();
  }

  @ApiOperation({
    summary: 'Obtener habitaciones con los detalles anidados de su piso',
    description: 'Ruta temporal/auxiliar para visualizar la jerarquía desde la habitación hacia arriba.'
  })
  @ApiResponse({ status: 200, description: 'Lista de habitaciones incluyendo la entidad Piso.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('detalles')
  obtenerTodasConPiso() {
    return this.habitacionesService.obtenerTodasConPiso();
  }

  @ApiOperation({ summary: 'Obtener todas las habitaciones filtradas por el ID de un edificio' })
  @ApiParam({ name: 'idEdificio', description: 'ID numérico del edificio principal' })
  @ApiResponse({ status: 200, description: 'Lista de habitaciones que pertenecen directa o indirectamente al edificio.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('edificio/:idEdificio')
  obtenerPorEdificio(@Param('idEdificio', ParseIntPipe) idEdificio: number) {
    return this.habitacionesService.obtenerPorEdificio(idEdificio);
  }

  // ==========================================
  // RUTAS PÚBLICAS Y DE ESTADÍSTICA
  // ==========================================

  @ApiOperation({
    summary: 'Obtener la cantidad total de habitaciones disponibles',
    description: 'Calcula el número de habitaciones cuya disponibilidad está en "true". Ruta de acceso general para usuarios autenticados.'
  })
  @ApiResponse({ status: 200, description: 'Retorna un valor numérico total.' })
  @UseGuards(JwtAuthGuard, RolesGuard) // Al no tener @Roles restrictivo, es accesible
  @Get('disponibles/total')
  obtenerTotalDisponibles() {
    return this.habitacionesService.obtenerTotalDisponibles();
  }

  // ==========================================
  // RUTAS ADMINISTRATIVAS - ACTUALIZACIÓN Y ELIMINACIÓN
  // ==========================================

  @ApiOperation({ summary: 'Modificar los datos de una habitación existente (capacidad, nro, disponibilidad)' })
  @ApiParam({ name: 'id', description: 'ID de la habitación a modificar' })
  @ApiBody({
    description: 'Objeto con las propiedades a actualizar',
    schema: {
      example: {
        capacidadActual: 1,
        disponibilidad: true
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Habitación modificada correctamente.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  modificarHabitacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosActualizados: any,
  ) {
    return this.habitacionesService.modificarHabitacion(id, datosActualizados);
  }

  @ApiOperation({ summary: 'Eliminar una habitación del sistema' })
  @ApiParam({ name: 'id', description: 'ID numérico de la habitación a eliminar' })
  @ApiResponse({ status: 200, description: 'Habitación eliminada correctamente.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  eliminarHabitacion(@Param('id', ParseIntPipe) id: number) {
    return this.habitacionesService.eliminarHabitacion(id);
  }
}