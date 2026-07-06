import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Logger, ParseIntPipe } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) { }
  private readonly logger = new Logger(PagosController.name);


  // POST http://localhost:3000/pagos/webhook
  @Post('webhook')
  @HttpCode(200)
  recibirNotificacionExterna(@Body() payload: any) {
    this.logger.log(`Recibida actualización del equipo de pagos: ${JSON.stringify(payload)}`);
    // Si el equipo de pagos envía notificaciones automáticas, 
    // se procesarían aquí en el futuro.
    return { received: true };
  }

}
