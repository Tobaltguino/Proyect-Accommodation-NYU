import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload } from '../auth/types/auth.types';
import { ResidenciasService } from '../residencias/residencias.service';
import { CreateSolicitudDto } from './dto';
import {
  AsignacionEstanciaEntity,
  PeriodoEntity,
  PlanAlimenticioEntity,
  SolicitudEntity,
} from './entities';
import {
  BuildingId,
  MealPlan,
  SolicitudStatus,
  StudentGender,
} from './enums/solicitud.enums';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(SolicitudEntity)
    private readonly solicitudRepository: Repository<SolicitudEntity>,
    @InjectRepository(PeriodoEntity)
    private readonly periodoRepository: Repository<PeriodoEntity>,
    @InjectRepository(AsignacionEstanciaEntity)
    private readonly asignacionRepository: Repository<AsignacionEstanciaEntity>,
    @InjectRepository(PlanAlimenticioEntity)
    private readonly planAlimenticioRepository: Repository<PlanAlimenticioEntity>,
    private readonly residenciasService: ResidenciasService,
  ) {}

  getStatus() {
    return { module: 'solicitudes', status: 'ok' };
  }

  async createSolicitud(user: JwtPayload, body: CreateSolicitudDto) {
    const semester = body.semester ?? '2026-1';
    const period = await this.resolvePeriod(semester);

    const existing = await this.solicitudRepository.findOne({
      where: {
        rutEstudiante: user.rut,
        idPeriodo: period.idPeriodo,
      },
    });

    if (existing) {
      throw new ConflictException('Ya existe una postulacion para este semestre');
    }

    const expectedBuilding =
      body.gender === StudentGender.MUJER ? BuildingId.FEMENINO : BuildingId.MASCULINO;

    const room = await this.residenciasService.findRoomByCodeAndBuilding(
      body.roomCode,
      expectedBuilding,
    );

    if (!room) {
      throw new NotFoundException('La habitacion seleccionada no existe');
    }

    if (room.allowedGender !== body.gender) {
      throw new BadRequestException('La habitacion no corresponde al genero seleccionado');
    }

    const currentOccupancy = await this.residenciasService.getRoomOccupancy(
      body.roomCode,
      semester,
    );

    if (currentOccupancy >= room.bedCapacity) {
      throw new ConflictException('La habitacion ya no tiene cupos disponibles');
    }

    const assignment = await this.asignacionRepository.save(
      this.asignacionRepository.create({
        fechaAsignacion: this.todayDate(),
        fechaCheckIn: null,
        fechaCheckOut: null,
        estado: 'Activa',
        idHabitacion: room.id,
        idPeriodo: period.idPeriodo,
        rutEstudiante: user.rut,
        rutAdmin: null,
      }),
    );

    await this.upsertMealPlan(user.rut, period.idPeriodo, body.mealPlan);

    const solicitud = await this.solicitudRepository.save(
      this.solicitudRepository.create({
        estado: this.toDbStatus(SolicitudStatus.EN_REVISION),
        fechaSolicitud: this.todayDate(),
        idPeriodo: period.idPeriodo,
        idAsignacion: assignment.idAsignacion,
        rutEstudiante: user.rut,
        rutAdmin: null,
      }),
    );

    return {
      id: solicitud.idSolicitud,
      rut: user.rut,
      fullName: user.fullName,
      semester,
      career: body.career,
      gender: body.gender,
      phone: body.phone,
      city: body.city,
      mealPlan: body.mealPlan,
      buildingId: room.buildingId,
      roomCode: room.roomCode,
      motivation: body.motivation,
      status: SolicitudStatus.EN_REVISION,
      reservationExpiresAt: null,
      updatedAt: new Date().toISOString(),
    };
  }

  async getMySolicitud(user: JwtPayload, semester?: string) {
    const effectiveSemester = semester ?? '2026-1';
    const period = await this.periodoRepository.findOne({
      where: { nombre: effectiveSemester },
    });

    if (!period) {
      return null;
    }

    const solicitud = await this.solicitudRepository.findOne({
      where: {
        rutEstudiante: user.rut,
        idPeriodo: period.idPeriodo,
      },
    });

    if (!solicitud) {
      return null;
    }

    const assignment = solicitud.idAsignacion
      ? await this.asignacionRepository.findOne({
          where: { idAsignacion: solicitud.idAsignacion },
        })
      : null;

    const roomInfo = assignment
      ? await this.residenciasService.findRoomByAssignment(assignment.idAsignacion)
      : null;

    const mealPlan = await this.planAlimenticioRepository.findOne({
      where: {
        rutEstudiante: user.rut,
        idPeriodo: period.idPeriodo,
      },
      order: { idPlan: 'DESC' },
    });

    return {
      id: solicitud.idSolicitud,
      rut: user.rut,
      fullName: user.fullName,
      semester: effectiveSemester,
      career: 'Sin informacion',
      gender: roomInfo?.gender ?? StudentGender.MUJER,
      phone: '-',
      city: '-',
      mealPlan: this.fromDbMealPlan(mealPlan?.tipoPlan),
      buildingId: roomInfo?.buildingId ?? BuildingId.FEMENINO,
      roomCode: roomInfo?.roomCode ?? '---',
      motivation: 'Registro migrado a Beta2',
      status: this.fromDbStatus(solicitud.estado),
      reservationExpiresAt: null,
      updatedAt: this.asIsoDate(solicitud.fechaSolicitud),
    };
  }

  private async resolvePeriod(semester: string): Promise<PeriodoEntity> {
    const existing = await this.periodoRepository.findOne({
      where: { nombre: semester },
    });

    if (existing) {
      return existing;
    }

    return this.periodoRepository.save(
      this.periodoRepository.create({
        nombre: semester,
        fechaInicio: '2026-03-01',
        fechaTermino: '2026-07-31',
      }),
    );
  }

  private async upsertMealPlan(
    userRut: string,
    periodId: number,
    mealPlan: MealPlan,
  ): Promise<void> {
    const tipoPlan = this.toDbMealPlan(mealPlan);
    const existing = await this.planAlimenticioRepository.findOne({
      where: { rutEstudiante: userRut, idPeriodo: periodId },
    });

    if (existing) {
      existing.tipoPlan = tipoPlan;
      await this.planAlimenticioRepository.save(existing);
      return;
    }

    await this.planAlimenticioRepository.save(
      this.planAlimenticioRepository.create({
        tipoPlan,
        rutEstudiante: userRut,
        idPeriodo: periodId,
      }),
    );
  }

  private toDbStatus(status: SolicitudStatus): string {
    if (status === SolicitudStatus.EN_REVISION) {
      return 'En Revision';
    }

    if (status === SolicitudStatus.APROBADA) {
      return 'Aprobada';
    }

    if (status === SolicitudStatus.RECHAZADA) {
      return 'Rechazada';
    }

    return 'Pendiente';
  }

  private fromDbStatus(status: string): SolicitudStatus {
    if (status === 'Aprobada') {
      return SolicitudStatus.APROBADA;
    }

    if (status === 'Rechazada') {
      return SolicitudStatus.RECHAZADA;
    }

    if (status === 'Pendiente') {
      return SolicitudStatus.EXPIRADA;
    }

    return SolicitudStatus.EN_REVISION;
  }

  private toDbMealPlan(mealPlan: MealPlan): string {
    if (mealPlan === MealPlan.VEGANA) {
      return 'Vegano';
    }

    if (mealPlan === MealPlan.VEGETARIANA) {
      return 'Vegetariano';
    }

    return 'Sin preferencia';
  }

  private fromDbMealPlan(tipoPlan?: string): MealPlan {
    if (tipoPlan === 'Vegano') {
      return MealPlan.VEGANA;
    }

    if (tipoPlan === 'Vegetariano') {
      return MealPlan.VEGETARIANA;
    }

    return MealPlan.OMNIVORA;
  }

  private todayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private asIsoDate(date: string): string {
    return new Date(`${date}T00:00:00.000Z`).toISOString();
  }
}
