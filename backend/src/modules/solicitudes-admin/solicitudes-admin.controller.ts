import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SolicitudesAdminService } from './solicitudes-admin.service';

@Controller('solicitudes-admin')
export class SolicitudesAdminController {
  constructor(private readonly solicitudesAdminService: SolicitudesAdminService) {}

  // GET http://localhost:3000/solicitudes-admin/periodo/1
  @Get('periodo/:idPeriodo')
  obtenerParaAdmin(@Param('idPeriodo', ParseIntPipe) idPeriodo: number) {
    return this.solicitudesAdminService.obtenerPorPeriodo(idPeriodo);
  }
}