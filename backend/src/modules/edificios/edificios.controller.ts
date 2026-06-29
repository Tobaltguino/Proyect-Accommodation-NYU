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
import { EdificiosService } from './edificios.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/common/types/authenticated-request.type';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('edificios')
export class EdificiosController {
  constructor(private readonly edificiosService: EdificiosService) {}

  // GET http://localhost:3000/edificios
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  obtenerTodos() {
    return this.edificiosService.obtenerTodos();
  }

  // GET http://localhost:3000/edificios/infraestructura
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('infraestructura')
  obtenerInfraestructuraCompleta() {
    return this.edificiosService.obtenerInfraestructuraCompleta();
  }

  // GET http://localhost:3000/edificios/infraestructura/Masculino
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('infraestructura/:generoEdificio')
  obtenerInfraestructuraCompletaPorGenero(
    @Param('generoEdificio') generoEdificio: string,
  ) {
    return this.edificiosService.obtenerInfraestructuraCompletaPorGenero(
      generoEdificio,
    );
  }

  // GET http://localhost:3000/edificios/genero/Masculino
  @UseGuards(JwtAuthGuard) // 1. Obliga a que la petición traiga un Token válido
  @Get('genero/:generoEdificio')
  obtenerPorGenero(
    @Param('generoEdificio') generoEdificio: string,
    @Req() request: AuthenticatedRequest, // 2. Capturamos al usuario que hizo la petición
  ) {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // 3.

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

  // PATCH http://localhost:3000/edificios/1
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  modificarEdificio(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosActualizados: any,
  ) {
    return this.edificiosService.modificarEdificio(id, datosActualizados);
  }

  private mapEdificioToDTO(edificio: any) {
    return {
      idEdificio: edificio.idEdificio,
      nombre: edificio.nombre,
      genero: edificio.genero,

      // Si tienes otras columnas básicas en tu entidad, agrégalas aquí.
      // Por ejemplo, si tienes 'ubicacion' o 'estado':
      // ubicacion: edificio.ubicacion,

      // Ejemplo de cómo aplanar un dato extra: Si en el find() trajeras los pisos,
      // podrías mandarle al frontend solo la cantidad de pisos así:
      // totalPisos: edificio.pisos ? edificio.pisos.length : 0
    };
  }
}
