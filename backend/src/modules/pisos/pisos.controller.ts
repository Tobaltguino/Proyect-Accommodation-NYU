import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

import { PisosService } from './pisos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Gestión de Pisos')
@ApiBearerAuth() // Exige el Token JWT de un administrador para todas las rutas
@Controller('pisos')
export class PisosController {
  constructor(private readonly pisosService: PisosService) { }

  @ApiOperation({ summary: 'Obtener el listado general de todos los pisos registrados' })
  @ApiResponse({ status: 200, description: 'Lista completa de pisos retornada exitosamente.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  obtenerTodos() {
    return this.pisosService.obtenerTodos();
  }

  @ApiOperation({ summary: 'Crear y asignar un nuevo piso a un edificio existente' })
  @ApiBody({
    description: 'Datos necesarios para la creación del piso',
    schema: {
      example: {
        nroPiso: 1,
        nombre: 'Primer Piso - Ala Norte',
        idEdificio: 2
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Piso creado y guardado exitosamente.' })
  @ApiResponse({ status: 404, description: 'El idEdificio proporcionado no existe.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  crearPiso(
    @Body('nroPiso') nroPiso: number,
    @Body('nombre') nombre: string,
    @Body('idEdificio') idEdificio: number,
  ) {
    return this.pisosService.crearPiso(nroPiso, nombre, idEdificio);
  }

  @ApiOperation({ summary: 'Obtener todos los pisos que pertenecen a un edificio en particular' })
  @ApiParam({ name: 'idEdificio', description: 'ID numérico del edificio a consultar' })
  @ApiResponse({ status: 200, description: 'Lista de pisos filtrada por el edificio.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('edificio/:idEdificio')
  obtenerPorEdificio(@Param('idEdificio', ParseIntPipe) idEdificio: number) {
    return this.pisosService.obtenerPorEdificio(idEdificio);
  }

  @ApiOperation({ summary: 'Modificar atributos de un piso existente (como su nombre o número)' })
  @ApiParam({ name: 'id', description: 'ID numérico del piso a modificar' })
  @ApiBody({
    description: 'Objeto parcial con los campos del piso que se desean actualizar',
    schema: { example: { nombre: 'Piso Remodelado' } }
  })
  @ApiResponse({ status: 200, description: 'Piso actualizado correctamente.' })
  @ApiResponse({ status: 404, description: 'Piso no encontrado.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  modificarPiso(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosActualizados: any,
  ) {
    return this.pisosService.modificarPiso(id, datosActualizados);
  }

  @ApiOperation({ summary: 'Eliminar definitivamente un piso del sistema' })
  @ApiParam({ name: 'id', description: 'ID numérico del piso a eliminar' })
  @ApiResponse({ status: 200, description: 'Piso eliminado de la base de datos.' })
  @ApiResponse({ status: 404, description: 'Piso no encontrado.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  eliminarPiso(@Param('id', ParseIntPipe) idPiso: number) {
    return this.pisosService.eliminarPiso(idPiso);
  }
}