import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudEntity } from '../solicitudes/entities/solicitud.entity';
import { UpdateSolicitudesAdminDto } from './dto/update-solicitudes-admin.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { JwtPayload } from '../auth/types/auth.types';
@Injectable()
export class SolicitudesAdminService {
  constructor(
    @InjectRepository(SolicitudEntity)
    private readonly solicitudRepo: Repository<SolicitudEntity>,
  ) {}

  async obtenerPorPeriodo(idPeriodo: number) {
    return await this.solicitudRepo.find({
      where: { idPeriodo: idPeriodo },
      order: { fechaSolicitud: 'DESC' },
    });
  }
  async obtenerTodas() {
    return await this.solicitudRepo.find();
  }
  async cambioEstadoYAdminSolicitud(
    idSolicitud: number,
    cambios: UpdateSolicitudesAdminDto,
    rutAdmin: string,
  ) {
    const solicitud = await this.solicitudRepo.findOne({
      where: { idSolicitud: idSolicitud },
    });
    if (!solicitud) {
      throw new NotFoundException(
        'throw new NotFoundException(`La solicitud con ID ${idSolicitud} no existe.`',
      );
    }
    solicitud.estado = cambios.estado;
    solicitud.rutAdmin = rutAdmin;
    return await this.solicitudRepo.save(solicitud);
  }
}
