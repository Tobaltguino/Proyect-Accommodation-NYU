import { Injectable } from '@nestjs/common';

@Injectable()
export class CheckinService {
  getStatus() {
    return { module: 'checkin', status: 'ok' };
  }
}
