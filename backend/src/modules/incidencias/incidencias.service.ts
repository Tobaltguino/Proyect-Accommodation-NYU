import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { PeriodoEntity } from '../solicitudes/entities';
import {
  CreateIncidenciaDto,
  EstadoIncidencia,
  IncidenciaQueryDto,
  UpdateIncidenciaEstadoDto,
} from './dto';
import { IncidenciaEstanciaEntity } from './entities';

@Injectable()
export class IncidenciasService {
  constructor(
    @InjectRepository(IncidenciaEstanciaEntity)
    private readonly incidenciaRepository: Repository<IncidenciaEstanciaEntity>,
    @InjectRepository(PeriodoEntity)
    private readonly periodoRepository: Repository<PeriodoEntity>,
  ) {}

  getStatus() {
    return { module: 'incidencias', status: 'ok' };
  }

  async createIncidencia(body: CreateIncidenciaDto): Promise<IncidenciaEstanciaEntity> {
    const incidencia = this.incidenciaRepository.create({
      descripcion: body.descripcion,
      estado: EstadoIncidencia.PENDIENTE,
      fecha: this.todayDate(),
      gravedad: body.gravedad,
      idHabitacion: body.idHabitacion,
      rutEstudiante: this.normalizeRut(body.rutEstudiante),
      rutAdmin: body.rutAdmin ? this.normalizeRut(body.rutAdmin) : null,
    });

    return this.incidenciaRepository.save(incidencia);
  }

  async getIncidencias(query: IncidenciaQueryDto): Promise<IncidenciaEstanciaEntity[]> {
    const where: FindOptionsWhere<IncidenciaEstanciaEntity> = {};

    if (query.estado) {
      where.estado = query.estado;
    }

    if (query.gravedad) {
      where.gravedad = query.gravedad;
    }

    if (query.rut) {
      where.rutEstudiante = this.normalizeRut(query.rut);
    }

    if (query.semester) {
      const period = await this.periodoRepository.findOne({
        where: { nombre: query.semester },
      });

      if (!period) {
        throw new NotFoundException('No existe el periodo solicitado');
      }

      where.fecha = Between(period.fechaInicio, period.fechaTermino);
    }

    return this.incidenciaRepository.find({
      where,
      order: {
        fecha: 'DESC',
        idIncidencia: 'DESC',
      },
    });
  }

  async updateEstadoIncidencia(
    incidenciaId: number,
    body: UpdateIncidenciaEstadoDto,
  ): Promise<IncidenciaEstanciaEntity> {
    if (!Number.isInteger(incidenciaId) || incidenciaId < 1) {
      throw new BadRequestException('El id de incidencia es invalido');
    }

    const incidencia = await this.incidenciaRepository.findOne({
      where: { idIncidencia: incidenciaId },
    });

    if (!incidencia) {
      throw new NotFoundException('No existe la incidencia solicitada');
    }

    incidencia.estado = body.estado;
    if (body.rutAdmin) {
      incidencia.rutAdmin = this.normalizeRut(body.rutAdmin);
    }

    return this.incidenciaRepository.save(incidencia);
  }

  private normalizeRut(rut: string): string {
    return rut.replace(/\./g, '').toUpperCase();
  }

  private todayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
