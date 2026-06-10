import { Controller, Get } from '@nestjs/common';
import { HistorialService } from './historial.service';

@Controller('historial')
export class HistorialController {
  constructor(private readonly historialService: HistorialService) {}

  @Get('status')
  status() {
    return this.historialService.getStatus();
  }
}
