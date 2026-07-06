import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

import { EdificiosService } from './edificios.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Gestión de Edificios e Infraestructura')
@ApiBearerAuth() // Exige el Token JWT en la interfaz de Swagger para todas estas rutas
@Controller('edificios')
export class EdificiosController {
  constructor(private readonly edificiosService: EdificiosService) { }

  // ==========================================
  // RUTAS ADMINISTRATIVAS
  // ==========================================

  @ApiOperation({ summary: 'Obtener el listado básico de todos los edificios' })
  @ApiResponse({ status: 200, description: 'Lista de edificios retornada exitosamente.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  obtenerTodos() {
    return this.edificiosService.obtenerTodos();
  }

  @ApiOperation({ summary: 'Modificar los datos de un edificio existente' })
  @ApiParam({ name: 'id', description: 'ID numérico del edificio a modificar' })
  @ApiBody({
    description: 'Objeto con los campos del edificio que se desean actualizar',
    schema: { example: { nombre: 'Edificio A Nuevo', genero: 'Mixto' } }
  })
  @ApiResponse({ status: 200, description: 'Edificio actualizado correctamente.' })
  @ApiResponse({ status: 404, description: 'Edificio no encontrado.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  modificarEdificio(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosActualizados: any,
  ) {
    return this.edificiosService.modificarEdificio(id, datosActualizados);
  }

  // ==========================================
  // RUTAS PÚBLICAS / ESTUDIANTES
  // ==========================================

  @ApiOperation({ summary: 'Obtener la jerarquía completa de infraestructura (Edificios > Pisos > Habitaciones)' })
  @ApiResponse({ status: 200, description: 'Árbol completo de infraestructura retornado.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('infraestructura')
  obtenerInfraestructuraCompleta() {
    return this.edificiosService.obtenerInfraestructuraCompleta();
  }

  @ApiOperation({ summary: 'Obtener la jerarquía de infraestructura filtrada por género' })
  @ApiParam({ name: 'generoEdificio', description: 'Género del edificio (Masculino, Femenino, Mixto)' })
  @ApiResponse({ status: 200, description: 'Árbol de infraestructura filtrado por género.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('infraestructura/:generoEdificio')
  obtenerInfraestructuraCompletaPorGenero(
    @Param('generoEdificio') generoEdificio: string,
  ) {
    return this.edificiosService.obtenerInfraestructuraCompletaPorGenero(
      generoEdificio,
    );
  }

  @ApiOperation({
    summary: 'Obtener listado de edificios por género (Con validación de acceso)',
    description: 'Los administradores pueden ver todos. Los estudiantes solo pueden ver edificios "Mixtos" o aquellos que coincidan con su propio género.'
  })
  @ApiParam({ name: 'generoEdificio', description: 'Género del edificio a consultar' })
  @ApiResponse({ status: 200, description: 'Lista de edificios retornada.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado (Forbidden) si un estudiante intenta ver edificios de un género distinto al suyo.' })
  @UseGuards(JwtAuthGuard) // Obliga a que la petición traiga un Token válido
  @Get('genero/:generoEdificio')
  obtenerPorGenero(
    @Param('generoEdificio') generoEdificio: string,
    @Req() request: AuthenticatedRequest, // Capturamos al usuario que hizo la petición
  ) {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Si es Administrador, tiene pase libre para ver cualquier edificio
    if (user.role === 'ADMIN') {
      return this.edificiosService.obtenerPorGenero(generoEdificio);
    }

    // Si es Estudiante, validamos su género
    if (user.role === 'STUDENT') {
      // Como el JWT actual no tiene el género, hacemos un MOCK (simulación).
      // En el futuro, cuando consuman la API externa, tu compañero solo debe
      // agregar el género al JWT y aquí usarás directamente: const generoEstudiante = user.genero;
      const generoEstudiante = user.genero;

      // Lógica: Si el edificio no es "Mixto" y el género del estudiante no coincide con el del edificio...
      if (generoEdificio !== 'Mixto' && generoEdificio !== generoEstudiante) {
        // Lanzamos un error HTTP 403 (Prohibido)
        throw new ForbiddenException(
          `Acceso denegado: Tu perfil es '${generoEstudiante}', no puedes ver información de edificios de género '${generoEdificio}'.`,
        );
      }
    }

    // Si pasó todas las validaciones de seguridad, le entregamos los datos
    return this.edificiosService.obtenerPorGenero(generoEdificio);
  }

  // ==========================================
  // MÉTODOS PRIVADOS
  // ==========================================

  private mapEdificioToDTO(edificio: any) {
    return {
      idEdificio: edificio.idEdificio,
      nombre: edificio.nombre,
      genero: edificio.genero,
    };
  }
}