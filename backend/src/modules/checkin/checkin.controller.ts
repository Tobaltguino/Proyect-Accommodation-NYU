import { Controller, Get, Param } from '@nestjs/common';
import { CheckinService } from './checkin.service';

@Controller('checkin')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Get(':rut')
  async obtenerAsignacionParaCheckIn(@Param('rut') rut: string) {
    return this.checkinService.obtenerDatosAsignacion(rut);
  }
}
