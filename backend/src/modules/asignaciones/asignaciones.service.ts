import { Injectable } from '@nestjs/common';

@Injectable()
export class AsignacionesService {
  getStatus() {
    return { module: 'asignaciones', status: 'ok' };
  }
}
