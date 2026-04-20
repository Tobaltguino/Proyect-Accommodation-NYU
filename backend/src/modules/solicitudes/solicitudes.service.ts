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
import { SolicitudEntity } from './entities';
import {
  BuildingId,
  SolicitudStatus,
  StudentGender,
} from './enums/solicitud.enums';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(SolicitudEntity)
    private readonly solicitudRepository: Repository<SolicitudEntity>,
    private readonly residenciasService: ResidenciasService,
  ) {}

  getStatus() {
    return { module: 'solicitudes', status: 'ok' };
  }

  async createSolicitud(user: JwtPayload, body: CreateSolicitudDto) {
    const semester = body.semester ?? '2026-1';
    const existing = await this.solicitudRepository.findOne({
      where: {
        rut: user.rut,
        semester,
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

    if (room.buildingId !== expectedBuilding || room.allowedGender !== body.gender) {
      throw new BadRequestException('La habitacion no corresponde al genero seleccionado');
    }

    const currentOccupancy = await this.residenciasService.getRoomOccupancy(
      body.roomCode,
      semester,
    );

    if (currentOccupancy >= room.bedCapacity) {
      throw new ConflictException('La habitacion ya no tiene cupos disponibles');
    }

    const reservationExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const solicitud = this.solicitudRepository.create({
      rut: user.rut,
      fullName: user.fullName,
      semester,
      career: body.career,
      gender: body.gender,
      phone: body.phone,
      city: body.city,
      mealPlan: body.mealPlan,
      buildingId: room.buildingId,
      roomCode: body.roomCode,
      motivation: body.motivation,
      status: SolicitudStatus.EN_REVISION,
      reservationExpiresAt,
    });

    const saved = await this.solicitudRepository.save(solicitud);

    return {
      id: saved.id,
      rut: saved.rut,
      fullName: saved.fullName,
      semester: saved.semester,
      status: saved.status,
      buildingId: saved.buildingId,
      roomCode: saved.roomCode,
      mealPlan: saved.mealPlan,
      reservationExpiresAt: saved.reservationExpiresAt,
      updatedAt: saved.updatedAt,
    };
  }

  async getMySolicitud(user: JwtPayload, semester?: string) {
    const effectiveSemester = semester ?? '2026-1';
    const solicitud = await this.solicitudRepository.findOne({
      where: {
        rut: user.rut,
        semester: effectiveSemester,
      },
    });

    if (!solicitud) {
      return null;
    }

    return {
      id: solicitud.id,
      rut: solicitud.rut,
      fullName: solicitud.fullName,
      semester: solicitud.semester,
      career: solicitud.career,
      gender: solicitud.gender,
      phone: solicitud.phone,
      city: solicitud.city,
      mealPlan: solicitud.mealPlan,
      buildingId: solicitud.buildingId,
      roomCode: solicitud.roomCode,
      motivation: solicitud.motivation,
      status: solicitud.status,
      reservationExpiresAt: solicitud.reservationExpiresAt,
      updatedAt: solicitud.updatedAt,
    };
  }
}
