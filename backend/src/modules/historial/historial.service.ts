import { Injectable } from '@nestjs/common';

@Injectable()
export class HistorialService {
  getStatus() {
    return { module: 'historial', status: 'ok' };
  }
}
