import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { HistorialService } from './historial.service';

@ApiTags('Historial y Auditoría') // Agrupa el endpoint en la categoría correcta
@Controller('historial')
export class HistorialController {
  constructor(private readonly historialService: HistorialService) { }

  @ApiOperation({
    summary: 'Verificar el estado del servicio de historial (Health Check)',
    description: 'Endpoint público para comprobar si el módulo de historial está en línea y respondiendo.'
  })
  @ApiResponse({ status: 200, description: 'Servicio en línea y funcionando correctamente.' })
  @Get('status')
  status() {
    return this.historialService.getStatus();
  }
}