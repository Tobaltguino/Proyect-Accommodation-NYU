import { Controller, Get } from '@nestjs/common';
import { CheckinService } from './checkin.service';

@Controller('checkin')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Get('status')
  status() {
    return this.checkinService.getStatus();
  }
}
