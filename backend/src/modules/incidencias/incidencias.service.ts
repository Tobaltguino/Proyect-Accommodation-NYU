import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { PeriodoEntity } from '../solicitudes/entities';
import { CreateIncidenciaDto, IncidenciaQueryDto } from './dto';
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

  async createIncidencia(
    body: CreateIncidenciaDto,
  ): Promise<IncidenciaEstanciaEntity> {
    const incidencia = this.incidenciaRepository.create({
      descripcion: body.descripcion,
      fecha: this.todayDate(),
      gravedad: body.gravedad,
      idHabitacion: body.idHabitacion,
      rutEstudiante: this.normalizeRut(body.rutEstudiante),
      rutAdmin: body.rutAdmin ? this.normalizeRut(body.rutAdmin) : null,
    });

    return this.incidenciaRepository.save(incidencia);
  }

  async getIncidencias(
    query: IncidenciaQueryDto,
  ): Promise<IncidenciaEstanciaEntity[]> {
    const where: FindOptionsWhere<IncidenciaEstanciaEntity> = {};

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
      relations: {
        habitacion: {
          piso: {
            edificio: true,
          },
        },
      },
      order: {
        fecha: 'DESC',
        idIncidencia: 'DESC',
      },
    });
  }

  private normalizeRut(rut: string): string {
    return rut.replace(/\./g, '').toUpperCase();
  }

  private todayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
