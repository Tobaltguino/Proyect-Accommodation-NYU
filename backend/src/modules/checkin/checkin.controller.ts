import {
  Controller,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
  BadRequestException, // <-- Importado para manejar el error 400 correctamente
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

import { CheckinService } from './checkin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Gestión de Ingresos (Check-In)')
@ApiBearerAuth() // Le dice a Swagger que todos los endpoints aquí dentro requieren Token JWT
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // Aplicado a la clase: Solo los administradores pueden usar este controlador
@Controller('checkin')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) { }

  @ApiOperation({
    summary: 'Registrar el ingreso físico (Check-In) de un estudiante',
    description: 'Permite al administrador confirmar que el estudiante ha llegado a la residencia, registrando la fecha exacta de ocupación de la cama.'
  })
  @ApiParam({ name: 'idAsignacion', description: 'ID numérico de la asignación vigente' })
  @ApiBody({
    description: 'Fecha en la que el estudiante realizó su ingreso',
    schema: { example: { fecha: '2026-07-06' } } // Un ejemplo claro para que el frontend sepa el formato esperado
  })
  @ApiResponse({ status: 200, description: 'Check-In registrado exitosamente en el sistema.' })
  @ApiResponse({ status: 400, description: 'Error de validación (Ej: No se envió la fecha en el body).' })
  @Patch(':idAsignacion')
  registrarCheckIn(
    @Param('idAsignacion', ParseIntPipe) idAsignacion: number,
    @Body('fecha') fecha: string,
  ) {
    if (!fecha) {
      // Usamos BadRequestException en lugar de Error genérico para respetar el protocolo HTTP
      throw new BadRequestException('Debes proporcionar la "fecha" en el body.');
    }

    return this.checkinService.registrarCheckIn(idAsignacion, fecha);
  }
}