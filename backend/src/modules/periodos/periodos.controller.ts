import { Controller, Get } from '@nestjs/common';
import { PeriodosService } from './periodos.service';

@Controller('periodos')
export class PeriodosController {
  constructor(private readonly periodosService: PeriodosService) {}

  // GET http://localhost:3000/periodos/actual
  @Get('actual')
  getActual() {
    return this.periodosService.obtenerActual();
  }

  // GET http://localhost:3000/periodos
  @Get()
  getAll() {
    return this.periodosService.obtenerTodos();
  }
}
