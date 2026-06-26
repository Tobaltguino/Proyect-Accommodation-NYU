import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudEntity } from '../solicitudes/entities/solicitud.entity';
import { PeriodoEntity } from '../solicitudes/entities/periodo.entity';
import { UpdateSolicitudesAdminDto } from './dto/update-solicitudes-admin.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { JwtPayload } from '../auth/types/auth.types';
import { In } from 'typeorm';

@Injectable()
export class SolicitudesAdminService {
  constructor(
    @InjectRepository(SolicitudEntity)
    private readonly solicitudRepo: Repository<SolicitudEntity>,
  ) { }


async obtenerPorPeriodo(idPeriodo: number) {
  const solicitudes = await this.solicitudRepo
    .createQueryBuilder('solicitud')
    .leftJoin('usuario', 'usuario', 'usuario.rut = solicitud.rut_estudiante') 
    .leftJoin('periodo', 'periodo', 'periodo.id_periodo = solicitud.id_periodo')
    .select([
      'solicitud.id_solicitud AS "idSolicitud"',
      'solicitud.fecha_solicitud AS "fechaSolicitud"',
      'solicitud.estado AS "estado"',
      'solicitud.id_periodo AS "idPeriodo"',
      'usuario.rut AS "rutEstudiante"',
      'usuario.nombre AS "nombreEstudiante"',
      'periodo.nombre AS "nombrePeriodo"' 
    ])
    .where('solicitud.id_periodo = :idPeriodo', { idPeriodo })
    .orderBy('solicitud.fecha_solicitud', 'DESC')
    .getRawMany(); 

  return solicitudes.length > 0 ? solicitudes : null;
}

async obtenerTodas() {
  const solicitudes = await this.solicitudRepo
    .createQueryBuilder('solicitud')
    .leftJoin('usuario', 'usuario', 'usuario.rut = solicitud.rut_estudiante') 
    .leftJoin('periodo', 'periodo', 'periodo.id_periodo = solicitud.id_periodo')
    .select([
      'solicitud.id_solicitud AS "idSolicitud"',
      'solicitud.fecha_solicitud AS "fechaSolicitud"',
      'solicitud.estado AS "estado"',
      'solicitud.id_periodo AS "idPeriodo"',
      'usuario.rut AS "rutEstudiante"',
      'usuario.nombre AS "nombreEstudiante"',
      'periodo.nombre AS "nombrePeriodo"' 
    ])
    .orderBy('solicitud.fecha_solicitud', 'DESC')
    .getRawMany(); 

  return solicitudes.length > 0 ? solicitudes : null;
}
  async cambioEstadoYAdminSolicitud(idSolicitud: number, cambios: UpdateSolicitudesAdminDto, rutAdmin: string){
    const solicitud = await this.solicitudRepo.findOne({
      where: {idSolicitud: idSolicitud}
    })
    if(!solicitud){
      throw new NotFoundException('throw new NotFoundException(`La solicitud con ID ${idSolicitud} no existe.`');
    }
    solicitud.estado = cambios.estado;
    solicitud.rutAdmin = rutAdmin;
    return await this.solicitudRepo.save(solicitud);
  }
}