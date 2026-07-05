import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudEntity } from '../solicitudes/entities/solicitud.entity';
import { UpdateSolicitudesAdminDto } from './dto/update-solicitudes-admin.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { JwtPayload } from '../auth/types/auth.types';
import { In } from 'typeorm';

@Injectable()
export class SolicitudesAdminService {
  constructor(
    @InjectRepository(SolicitudEntity)
    private readonly solicitudRepo: Repository<SolicitudEntity>,
  ) {}

  async obtenerPorPeriodo(idPeriodo: number) {
    return await this.solicitudRepo
      .createQueryBuilder('solicitud')
      .leftJoin('usuario', 'usuario', 'usuario.rut = solicitud.rutEstudiante') // Ajusta 'rutUsuario' si es necesario
      .select([
        'solicitud.idSolicitud',
        'solicitud.fechaSolicitud',
        'solicitud.estado',
        'solicitud.idPeriodo',
        'usuario.rut',
        'usuario.nombre',
      ])
      .where('solicitud.idPeriodo = :idPeriodo', { idPeriodo })
      .andWhere('solicitud.estado IN (:...estados)', {
        estados: ['en revision', 'pendiente'],
      })
      .orderBy('solicitud.fechaSolicitud', 'DESC')
      .getMany();
  }

  async obtenerTodas() {
    return await this.solicitudRepo
      .createQueryBuilder('solicitud')
      .leftJoin('usuario', 'usuario', 'usuario.rut = solicitud.rutEstudiante') // Ajusta 'rutUsuario' al nombre de tu columna
      .select([
        'solicitud.idSolicitud',
        'solicitud.fechaSolicitud',
        'solicitud.estado',
        'usuario.rut',
        'usuario.nombre',
      ])
      .where('solicitud.estado IN (:...estados)', {
        estados: ['En Revision', 'Pendiente'],
      })
      .getMany();
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
