import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { AsignacionEntity } from '../asignaciones/entities/asignacion.entity';
import { HabitacionEntity } from '../residencias/entities';
import { PeriodoEntity } from '../solicitudes/entities';
import { UsuarioEntity } from '../users/entities';
import { CreateIncidenciaDto, IncidenciaQueryDto } from './dto';
import { GravedadIncidencia } from './dto/create-incidencia.dto';
import { IncidenciaEstanciaEntity } from './entities';

type IncidenciaResponse = IncidenciaEstanciaEntity & {
  nroHabitacion?: number;
  idPiso?: number;
  nroPiso?: number;
  nombreEdificio?: string;
  ubicacion?: string;
};

type EvaluacionResidencial = {
  rutEstudiante: string;
  puntaje: number;
  nivel: 'BAJO' | 'MEDIO' | 'ALTO';
  totalIncidencias: number;
  incidenciasGraves: number;
  recomendacion: string;
};

@Injectable()
export class IncidenciasService {
  constructor(
    @InjectRepository(IncidenciaEstanciaEntity)
    private readonly incidenciaRepository: Repository<IncidenciaEstanciaEntity>,
    @InjectRepository(PeriodoEntity)
    private readonly periodoRepository: Repository<PeriodoEntity>,
    @InjectRepository(HabitacionEntity)
    private readonly habitacionRepository: Repository<HabitacionEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
    @InjectRepository(AsignacionEntity)
    private readonly asignacionRepository: Repository<AsignacionEntity>,
  ) {}

  getStatus() {
    return { module: 'incidencias', status: 'ok' };
  }

  async createIncidencia(
    body: CreateIncidenciaDto,
  ): Promise<IncidenciaEstanciaEntity> {
    const rutEstudiante = this.normalizeRut(body.rutEstudiante);

    const habitacion = await this.habitacionRepository.findOne({
      where: { idHabitacion: body.idHabitacion },
    });

    if (!habitacion) {
      throw new NotFoundException('La habitacion indicada no existe');
    }

    const estudiante = await this.usuarioRepository.findOne({
      where: { rut: rutEstudiante, tipoUsuario: 'Estudiante' },
    });

    if (!estudiante) {
      throw new NotFoundException('El estudiante indicado no existe');
    }

    const asignacionActiva = await this.asignacionRepository.findOne({
      where: {
        rutEstudiante,
        idHabitacion: body.idHabitacion,
        estado: 'Activa',
      },
    });

    if (!asignacionActiva) {
      throw new BadRequestException(
        'El estudiante no tiene una asignacion activa en esta habitacion',
      );
    }

    const incidencia = this.incidenciaRepository.create({
      descripcion: body.descripcion,
      fecha: this.todayDate(),
      gravedad: body.gravedad,
      idHabitacion: body.idHabitacion,
      rutEstudiante,
      rutAdmin: body.rutAdmin ? this.normalizeRut(body.rutAdmin) : null,
    });

    return this.incidenciaRepository.save(incidencia);
  }

  async getIncidencias(
    query: IncidenciaQueryDto,
  ): Promise<IncidenciaResponse[]> {
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

    const incidencias = await this.incidenciaRepository.find({
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

    return incidencias.map((incidencia) => this.mapIncidencia(incidencia));
  }

  async getEvaluacionResidencial(
    rutEstudiante: string,
  ): Promise<EvaluacionResidencial> {
    const rutNormalizado = this.normalizeRut(rutEstudiante);
    const incidencias = await this.incidenciaRepository.find({
      where: { rutEstudiante: rutNormalizado },
    });

    const puntaje = incidencias.reduce(
      (total, incidencia) =>
        total + this.getPuntajeGravedad(incidencia.gravedad),
      0,
    );
    const incidenciasGraves = incidencias.filter(
      (incidencia) => incidencia.gravedad === GravedadIncidencia.GRAVE,
    ).length;
    const nivel = this.getNivelRiesgo(puntaje, incidenciasGraves);

    return {
      rutEstudiante: rutNormalizado,
      puntaje,
      nivel,
      totalIncidencias: incidencias.length,
      incidenciasGraves,
      recomendacion: this.getRecomendacion(nivel),
    };
  }

  private normalizeRut(rut: string): string {
    return rut.replace(/\./g, '').toUpperCase();
  }

  private todayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private mapIncidencia(
    incidencia: IncidenciaEstanciaEntity,
  ): IncidenciaResponse {
    return {
      ...incidencia,
      nroHabitacion: incidencia.habitacion?.nroHabitacion,
      idPiso: incidencia.habitacion?.piso?.idPiso,
      nroPiso: incidencia.habitacion?.piso?.nroPiso,
      nombreEdificio: incidencia.habitacion?.piso?.edificio?.nombre,
      ubicacion: incidencia.habitacion?.piso?.edificio?.ubicacion,
    };
  }

  private getPuntajeGravedad(gravedad: string): number {
    switch (gravedad) {
      case GravedadIncidencia.GRAVE:
        return 6;
      case GravedadIncidencia.MODERADO:
        return 3;
      case GravedadIncidencia.LEVE:
        return 1;
      default:
        return 0;
    }
  }

  private getNivelRiesgo(
    puntaje: number,
    incidenciasGraves: number,
  ): EvaluacionResidencial['nivel'] {
    if (puntaje >= 8 || incidenciasGraves >= 2) {
      return 'ALTO';
    }

    if (puntaje >= 4 || incidenciasGraves >= 1) {
      return 'MEDIO';
    }

    return 'BAJO';
  }

  private getRecomendacion(nivel: EvaluacionResidencial['nivel']): string {
    if (nivel === 'ALTO') {
      return 'Revisar el historial de incidencias antes de aprobar la asignacion';
    }

    if (nivel === 'MEDIO') {
      return 'Considerar las incidencias registradas durante la revision';
    }

    return 'Sin observaciones relevantes para la asignacion';
  }
}
