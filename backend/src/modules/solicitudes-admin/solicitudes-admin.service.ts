import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudEntity } from '../solicitudes/entities/solicitud.entity';

@Injectable()
export class SolicitudesAdminService {
  constructor(
    @InjectRepository(SolicitudEntity)
    private readonly solicitudRepo: Repository<SolicitudEntity>,
  ) { }

  // El Admin solicita ver las peticiones de un periodo específico
  async obtenerPorPeriodo(idPeriodo: number) {
    return await this.solicitudRepo.find({
      where: { idPeriodo: idPeriodo },
      // Eliminamos el bloque relations porque el RUT ya es parte de la tabla base
      order: { fechaSolicitud: 'DESC' }
    });
  }
}