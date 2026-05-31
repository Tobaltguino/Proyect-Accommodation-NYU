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
  UnauthorizedException
} from '@nestjs/common'; import { EdificiosService } from './edificios.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/common/types/authenticated-request.type';

@Controller('edificios')
export class EdificiosController {
  constructor(private readonly edificiosService: EdificiosService) { }

  // GET http://localhost:3000/edificios
  @Get()
  obtenerTodos() {
    return this.edificiosService.obtenerTodos();
  }

  // PATCH http://localhost:3000/edificios/1
  @Patch(':id')
  modificarEdificio(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosActualizados: any
  ) {
    return this.edificiosService.modificarEdificio(id, datosActualizados);
  }

  // GET http://localhost:3000/edificios/genero/Masculino
  @UseGuards(JwtAuthGuard) // 1. Obliga a que la petición traiga un Token válido
  @Get('genero/:generoEdificio')
  obtenerPorGenero(
    @Param('generoEdificio') generoEdificio: string,
    @Req() request: AuthenticatedRequest // 2. Capturamos al usuario que hizo la petición
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
          `Acceso denegado: Tu perfil es '${generoEstudiante}', no puedes ver información de edificios de género '${generoEdificio}'.`
        );
      }
    }

    // Si pasó todas las validaciones de seguridad, le entregamos los datos
    return this.edificiosService.obtenerPorGenero(generoEdificio);
  }

}