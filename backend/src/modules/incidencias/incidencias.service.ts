import { Injectable } from '@nestjs/common';

@Injectable()
export class IncidenciasService {
  getStatus() {
    return { module: 'incidencias', status: 'ok' };
  }
}
