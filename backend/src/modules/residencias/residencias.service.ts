import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudEntity } from '../solicitudes/entities';
import {
  BuildingId,
  SolicitudStatus,
  StudentGender,
} from '../solicitudes/enums/solicitud.enums';
import { HabitacionEntity } from './entities';

@Injectable()
export class ResidenciasService implements OnModuleInit {
  constructor(
    @InjectRepository(HabitacionEntity)
    private readonly habitacionRepository: Repository<HabitacionEntity>,
    @InjectRepository(SolicitudEntity)
    private readonly solicitudRepository: Repository<SolicitudEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureSeedRooms();
  }

  getStatus() {
    return { module: 'residencias', status: 'ok' };
  }

  async getAvailability(gender: StudentGender, semester = '2026-1') {
    const buildingId =
      gender === StudentGender.MUJER ? BuildingId.FEMENINO : BuildingId.MASCULINO;

    const rooms = await this.habitacionRepository.find({
      where: { buildingId },
      order: { floor: 'DESC', roomCode: 'ASC' },
    });

    const activeStatuses = [SolicitudStatus.EN_REVISION, SolicitudStatus.APROBADA];
    const reservations = await this.solicitudRepository.find({
      where: {
        semester,
        status: activeStatuses[0],
      },
      select: ['roomCode', 'reservationExpiresAt'],
    });

    const approved = await this.solicitudRepository.find({
      where: {
        semester,
        status: activeStatuses[1],
      },
      select: ['roomCode'],
    });

    const now = new Date();
    const occupiedByRoom = new Map<string, number>();

    for (const reservation of reservations) {
      const isExpired =
        reservation.reservationExpiresAt !== null &&
        reservation.reservationExpiresAt.getTime() < now.getTime();

      if (isExpired) {
        continue;
      }

      occupiedByRoom.set(
        reservation.roomCode,
        (occupiedByRoom.get(reservation.roomCode) ?? 0) + 1,
      );
    }

    for (const reservation of approved) {
      occupiedByRoom.set(
        reservation.roomCode,
        (occupiedByRoom.get(reservation.roomCode) ?? 0) + 1,
      );
    }

    const floorsMap = new Map<number, Array<{ code: string; occupiedBeds: number; totalBeds: number }>>();

    for (const room of rooms) {
      const list = floorsMap.get(room.floor) ?? [];
      list.push({
        code: room.roomCode,
        occupiedBeds: occupiedByRoom.get(room.roomCode) ?? 0,
        totalBeds: room.bedCapacity,
      });
      floorsMap.set(room.floor, list);
    }

    const floors = Array.from(floorsMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([level, floorRooms]) => ({
        level,
        rooms: floorRooms,
      }));

    return {
      semester,
      building: {
        id: buildingId,
        label: buildingId === BuildingId.FEMENINO ? 'Edificio Femenino' : 'Edificio Masculino',
        gender,
        floors,
      },
    };
  }

  async findRoomByCode(roomCode: string) {
    return this.habitacionRepository.findOne({ where: { roomCode } });
  }

  async findRoomByCodeAndBuilding(roomCode: string, buildingId: BuildingId) {
    return this.habitacionRepository.findOne({ where: { roomCode, buildingId } });
  }

  async getRoomOccupancy(roomCode: string, semester: string): Promise<number> {
    const now = new Date();
    const records = await this.solicitudRepository.find({
      where: { semester, roomCode },
      select: ['status', 'reservationExpiresAt'],
    });

    return records.filter((record) => {
      if (record.status === SolicitudStatus.APROBADA) {
        return true;
      }

      if (record.status !== SolicitudStatus.EN_REVISION) {
        return false;
      }

      if (!record.reservationExpiresAt) {
        return true;
      }

      return record.reservationExpiresAt.getTime() >= now.getTime();
    }).length;
  }

  private async ensureSeedRooms(): Promise<void> {
    const existing = await this.habitacionRepository.count();

    if (existing > 0) {
      return;
    }

    const createRooms = (buildingId: BuildingId, allowedGender: StudentGender) => {
      const rooms: HabitacionEntity[] = [];

      for (const floor of [1, 2, 3, 4]) {
        for (let room = 1; room <= 8; room += 1) {
          rooms.push(
            this.habitacionRepository.create({
              buildingId,
              allowedGender,
              floor,
              roomCode: `${floor}${room.toString().padStart(2, '0')}`,
              bedCapacity: 2,
            }),
          );
        }
      }

      return rooms;
    };

    const seed = [
      ...createRooms(BuildingId.FEMENINO, StudentGender.MUJER),
      ...createRooms(BuildingId.MASCULINO, StudentGender.HOMBRE),
    ];

    await this.habitacionRepository.save(seed);
  }
}
