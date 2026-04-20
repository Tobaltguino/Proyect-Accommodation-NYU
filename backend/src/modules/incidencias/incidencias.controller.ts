import { Controller, Get } from '@nestjs/common';
import { IncidenciasService } from './incidencias.service';

@Controller('incidencias')
export class IncidenciasController {
  constructor(private readonly incidenciasService: IncidenciasService) {}

  @Get('status')
  status() {
    return this.incidenciasService.getStatus();
  }
}
