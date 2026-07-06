import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

import { MatriculaIntegrationService } from './matricula-integration.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Integración con Sistema de Matrícula (API Externa)')
@ApiBearerAuth() // Activa el requerimiento del token JWT para este controlador
@Controller('matricula')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatriculaIntegrationController {
  constructor(private readonly service: MatriculaIntegrationService) { }

  @ApiOperation({
    summary: 'Verificar estado de alumno regular en el sistema externo',
    description: 'Consulta la API de la institución para confirmar si un estudiante (buscado por su RUT) mantiene su matrícula activa y es alumno regular.'
  })
  @ApiParam({
    name: 'rut',
    description: 'RUT del estudiante (Ej: 19123456-7)',
    example: '19123456-7'
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna un objeto con el estado booleano de la matrícula.',
    schema: { example: { esActivo: true } } // Muestra exactamente cómo llegará el JSON al frontend
  })
  @ApiResponse({ status: 401, description: 'No autorizado (Falta token JWT o está expirado).' })
  @ApiResponse({ status: 403, description: 'Acceso denegado (Exclusivo para rol ADMIN).' })
  @Roles(Role.ADMIN)
  @Get(':rut/estado') // Slash inicial removido para apegarse al estándar de NestJS
  async verificar(@Param('rut') rut: string) {
    const esActivo = await this.service.verificarMatricula(rut);
    return { esActivo };
  }
}