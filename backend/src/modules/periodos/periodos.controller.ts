import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { PeriodosService } from './periodos.service';

@ApiTags('Gestión de Periodos Académicos')
@Controller('periodos')
export class PeriodosController {
  constructor(private readonly periodosService: PeriodosService) { }

  @ApiOperation({
    summary: 'Obtener el periodo académico activo (Actual)',
    description: 'Endpoint público. Devuelve el periodo que se encuentra vigente en el sistema. Ideal para que el frontend inicialice variables globales o muestre el semestre actual en pantalla.'
  })
  @ApiResponse({
    status: 200,
    description: 'Periodo actual obtenido exitosamente.',
    schema: {
      example: {
        idPeriodo: 1,
        nombre: 'Primer Semestre 2026',
        fechaInicio: '2026-03-01',
        fechaFin: '2026-07-15',
        activo: true
      }
    }
  })
  @Get('actual')
  getActual() {
    return this.periodosService.obtenerActual();
  }

  @ApiOperation({
    summary: 'Obtener el listado completo de todos los periodos',
    description: 'Endpoint público. Retorna el historial completo de los periodos académicos registrados en la base de datos (pasados, actuales y futuros).'
  })
  @ApiResponse({ status: 200, description: 'Lista completa de periodos retornada exitosamente.' })
  @Get()
  getAll() {
    return this.periodosService.obtenerTodos();
  }
}