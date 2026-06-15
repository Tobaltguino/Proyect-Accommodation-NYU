import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionEntity } from '../asignaciones/entities/asignacion.entity';
import { JwtPayload } from '../auth/types/auth.types';
import { PeriodosService } from '../periodos/periodos.service';
import { CreateSolicitudDto } from './dto';
import { SolicitudEntity } from './entities';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(SolicitudEntity)
    private readonly solicitudRepository: Repository<SolicitudEntity>,

    @InjectRepository(AsignacionEntity)
    private readonly asignacionRepository: Repository<AsignacionEntity>,

    private readonly periodosService: PeriodosService,
  ) {}

  getStatus() {
    return { module: 'solicitudes', status: 'ok' };
  }

  async createSolicitud(user: JwtPayload, body: CreateSolicitudDto) {
    try {
      const periodoActual = await this.periodosService.obtenerActual();
      if (!periodoActual) {
        throw new BadRequestException('No hay un periodo académico activo.');
      }

      const rutEstudianteStr = user.rut;

      const existing = await this.solicitudRepository.findOne({
        where: {
          rutEstudiante: user.rut,
          idPeriodo: periodoActual.idPeriodo,
        },
      });

      if (existing) {
        throw new ConflictException(
          'Ya existe una postulacion para este semestre',
        );
      }

      const solicitud = await this.solicitudRepository.save(
        this.solicitudRepository.create({
          estado: 'Pendiente',
          fechaSolicitud: new Date().toISOString().split('T')[0],
          idPeriodo: periodoActual.idPeriodo,
          idAsignacion: null,
          rutEstudiante: rutEstudianteStr,
          rutAdmin: null,
          planAlimenticio: body.planAlimenticio,
        }),
      );

      return this.mapSolicitudResponse(solicitud);
    } catch (error) {
      if (error instanceof ConflictException) throw error;

      const mensajeError =
        error instanceof Error ? error.message : 'Error desconocido';

      throw new BadRequestException(
        'Error al procesar la solicitud: ' + mensajeError,
      );
    }
  }

  async getMySolicitud(user: JwtPayload) {
    const periodoActual = await this.periodosService.obtenerActual();
    if (!periodoActual) return null;

    const solicitud = await this.solicitudRepository.findOne({
      where: {
        rutEstudiante: user.rut,
        idPeriodo: periodoActual.idPeriodo,
      },
    });

    if (!solicitud) return null;

    let asignacion: AsignacionEntity | null = null;

    try {
      asignacion = await this.findSolicitudAsignacion(solicitud);
    } catch {
      asignacion = null;
    }

    return this.mapSolicitudResponse(solicitud, asignacion, periodoActual.nombre);
  }

  private async findSolicitudAsignacion(solicitud: SolicitudEntity) {
    const relations = {
      periodo: true,
      habitacion: {
        piso: {
          edificio: true,
        },
      },
    };

    if (solicitud.idAsignacion) {
      const asignacionPorSolicitud = await this.asignacionRepository.findOne({
        where: {
          idAsignacion: solicitud.idAsignacion,
          rutEstudiante: solicitud.rutEstudiante,
        },
        relations,
      });

      if (asignacionPorSolicitud) return asignacionPorSolicitud;
    }

    return this.asignacionRepository.findOne({
      where: {
        rutEstudiante: solicitud.rutEstudiante,
        idPeriodo: solicitud.idPeriodo,
        estado: 'Activa',
      },
      relations,
      order: { fechaAsignacion: 'DESC' },
    });
  }

  private mapSolicitudResponse(
    solicitud: SolicitudEntity,
    asignacion?: AsignacionEntity | null,
    nombrePeriodo?: string,
  ) {
    return {
      id: solicitud.idSolicitud,
      idSolicitud: solicitud.idSolicitud,
      estado: solicitud.estado,
      status: solicitud.estado,
      fechaSolicitud: solicitud.fechaSolicitud,
      idPeriodo: solicitud.idPeriodo,
      idAsignacion: solicitud.idAsignacion,
      rutEstudiante: solicitud.rutEstudiante,
      rut: solicitud.rutEstudiante,
      rutAdmin: solicitud.rutAdmin,
      planAlimenticio: solicitud.planAlimenticio,
      mealPlan: solicitud.planAlimenticio,
      semester:
        asignacion?.periodo?.nombre ?? nombrePeriodo ?? solicitud.idPeriodo.toString(),
      nombrePeriodo: asignacion?.periodo?.nombre ?? nombrePeriodo,
      asignacion: asignacion ? this.mapAsignacionResponse(asignacion) : null,
      reservationExpiresAt: null,
      updatedAt: solicitud.fechaSolicitud,
    };
  }

  private mapAsignacionResponse(asignacion: AsignacionEntity) {
    const habitacion = asignacion.habitacion;
    const piso = habitacion?.piso;
    const edificio = piso?.edificio;

    return {
      idAsignacion: asignacion.idAsignacion,
      fechaAsignacion: asignacion.fechaAsignacion,
      fechaCheckIn: asignacion.fechaCheckIn,
      fechaCheckOut: asignacion.fechaCheckOut,
      estado: asignacion.estado,
      idHabitacion: asignacion.idHabitacion,
      idPeriodo: asignacion.idPeriodo,
      rutEstudiante: asignacion.rutEstudiante,
      rutAdmin: asignacion.rutAdmin,
      nombrePeriodo: asignacion.periodo?.nombre,
      numeroHabitacion: habitacion?.nroHabitacion?.toString(),
      idPiso: piso?.idPiso,
      numeroPiso: piso?.nroPiso,
      nombrePiso: piso?.nombre,
      idEdificio: edificio?.idEdificio,
      nombreEdificio: edificio?.nombre,
      ubicacionEdificio: edificio?.ubicacion,
    };
  }
}
