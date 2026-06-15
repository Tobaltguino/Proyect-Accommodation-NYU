import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  AsignacionEstanciaEntity,
  PeriodoEntity,
  SolicitudEntity,
} from '../solicitudes/entities';
import {
  BuildingId,
  SolicitudStatus,
  StudentGender,
} from '../solicitudes/enums/solicitud.enums';
import { EdificioEntity, HabitacionEntity, PisoEntity } from './entities';

@Injectable()
export class ResidenciasService implements OnModuleInit {
  constructor(
    @InjectRepository(HabitacionEntity)
    private readonly habitacionRepository: Repository<HabitacionEntity>,
    @InjectRepository(PisoEntity)
    private readonly pisoRepository: Repository<PisoEntity>,
    @InjectRepository(EdificioEntity)
    private readonly edificioRepository: Repository<EdificioEntity>,
    @InjectRepository(SolicitudEntity)
    private readonly solicitudRepository: Repository<SolicitudEntity>,
    @InjectRepository(AsignacionEstanciaEntity)
    private readonly asignacionRepository: Repository<AsignacionEstanciaEntity>,
    @InjectRepository(PeriodoEntity)
    private readonly periodoRepository: Repository<PeriodoEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureSeedInfrastructure();
  }

  getStatus() {
    return { module: 'residencias', status: 'ok' };
  }

  async getAvailability(gender: StudentGender, semester = '2026-1') {
    const period = await this.resolvePeriod(semester);
    const targetGenero = this.genderToGenero(gender);

    const building = await this.edificioRepository.findOne({
      where: { genero: targetGenero },
    });

    if (!building) {
      return {
        semester,
        building: {
          id: this.generoToBuildingId(targetGenero),
          label: this.generoToLabel(targetGenero),
          gender,
          floors: [],
        },
      };
    }

    const floors = await this.pisoRepository.find({
      where: { idEdificio: building.idEdificio },
      order: { nroPiso: 'DESC' },
    });

    const floorIds = floors.map((floor) => floor.idPiso);
    const rooms =
      floorIds.length > 0
        ? await this.habitacionRepository.find({
            where: { idPiso: In(floorIds) },
            order: { nroHabitacion: 'ASC' },
          })
        : [];

    const occupiedByRoom = await this.getOccupiedBedsByRoom(period.idPeriodo);

    const floorsPayload = floors.map((floor) => {
      const floorRooms = rooms
        .filter((room) => room.idPiso === floor.idPiso)
        .map((room) => ({
          code: this.toRoomCode(floor.nroPiso, room.nroHabitacion),
          occupiedBeds: occupiedByRoom.get(room.idHabitacion) ?? 0,
          totalBeds: room.capacidadActual,
        }));

      return {
        level: floor.nroPiso,
        rooms: floorRooms,
      };
    });

    return {
      semester,
      building: {
        id: this.generoToBuildingId(targetGenero),
        label: this.generoToLabel(targetGenero),
        gender,
        floors: floorsPayload,
      },
    };
  }

  async findRoomByCodeAndBuilding(roomCode: string, buildingId: BuildingId) {
    const parsed = this.parseRoomCode(roomCode);
    if (!parsed) {
      return null;
    }

    const genero =
      buildingId === BuildingId.FEMENINO ? 'Femenino' : 'Masculino';

    const building = await this.edificioRepository.findOne({
      where: { genero },
    });
    if (!building) {
      return null;
    }

    const floor = await this.pisoRepository.findOne({
      where: {
        idEdificio: building.idEdificio,
        nroPiso: parsed.floor,
      },
    });

    if (!floor) {
      return null;
    }

    const room = await this.habitacionRepository.findOne({
      where: {
        idPiso: floor.idPiso,
        nroHabitacion: parsed.room,
      },
    });

    if (!room) {
      return null;
    }

    return {
      id: room.idHabitacion,
      buildingId,
      allowedGender:
        buildingId === BuildingId.FEMENINO
          ? StudentGender.MUJER
          : StudentGender.HOMBRE,
      floor: parsed.floor,
      roomCode: this.toRoomCode(parsed.floor, parsed.room),
      bedCapacity: room.capacidadActual,
    };
  }

  async getRoomOccupancy(roomCode: string, semester: string): Promise<number> {
    const period = await this.resolvePeriod(semester);
    const parsed = this.parseRoomCode(roomCode);

    if (!parsed) {
      return 0;
    }

    const floors = await this.pisoRepository.find({
      where: { nroPiso: parsed.floor },
    });

    if (floors.length === 0) {
      return 0;
    }

    const rooms = await this.habitacionRepository.find({
      where: {
        idPiso: In(floors.map((floor) => floor.idPiso)),
        nroHabitacion: parsed.room,
      },
    });

    if (rooms.length === 0) {
      return 0;
    }

    const occupiedByRoom = await this.getOccupiedBedsByRoom(period.idPeriodo);
    return rooms.reduce(
      (total, room) => total + (occupiedByRoom.get(room.idHabitacion) ?? 0),
      0,
    );
  }

  async findRoomByAssignment(idAsignacion: number) {
    const assignment = await this.asignacionRepository.findOne({
      where: { idAsignacion },
    });

    if (!assignment) {
      return null;
    }

    const room = await this.habitacionRepository.findOne({
      where: { idHabitacion: assignment.idHabitacion },
    });

    if (!room) {
      return null;
    }

    const floor = await this.pisoRepository.findOne({
      where: { idPiso: room.idPiso },
    });

    if (!floor) {
      return null;
    }

    const building = await this.edificioRepository.findOne({
      where: { idEdificio: floor.idEdificio },
    });

    if (!building) {
      return null;
    }

    const buildingId = this.generoToBuildingId(
      building.genero === 'Femenino' ? 'Femenino' : 'Masculino',
    );

    return {
      roomCode: this.toRoomCode(floor.nroPiso, room.nroHabitacion),
      buildingId,
      gender:
        buildingId === BuildingId.FEMENINO
          ? StudentGender.MUJER
          : StudentGender.HOMBRE,
    };
  }

  private async ensureSeedInfrastructure(): Promise<void> {
    const roomsCount = await this.habitacionRepository.count();
    if (roomsCount > 0) {
      await this.resolvePeriod('2026-1');
      return;
    }

    const femenino = await this.edificioRepository.save(
      this.edificioRepository.create({
        nombre: 'Residencia Femenina',
        ubicacion: 'Campus Norte',
        capacidadHabitaciones: 32,
        genero: 'Femenino',
      }),
    );

    const masculino = await this.edificioRepository.save(
      this.edificioRepository.create({
        nombre: 'Residencia Masculina',
        ubicacion: 'Campus Sur',
        capacidadHabitaciones: 32,
        genero: 'Masculino',
      }),
    );

    await this.createFloorsAndRooms(femenino.idEdificio);
    await this.createFloorsAndRooms(masculino.idEdificio);
    await this.resolvePeriod('2026-1');
  }

  private async createFloorsAndRooms(idEdificio: number): Promise<void> {
    for (const level of [1, 2, 3, 4]) {
      const floor = await this.pisoRepository.save(
        this.pisoRepository.create({
          idEdificio,
          nroPiso: level,
          nombre: `Piso ${level}`,
        }),
      );

      const rooms = Array.from({ length: 8 }, (_, index) =>
        this.habitacionRepository.create({
          disponibilidad: true,
          capacidadActual: 2,
          nroHabitacion: index + 1,
          idPiso: floor.idPiso,
        }),
      );

      await this.habitacionRepository.save(rooms);
    }
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

  private async getOccupiedBedsByRoom(
    periodId: number,
  ): Promise<Map<number, number>> {
    const activeStatuses = ['En Revision', 'Aprobada'];

    const activeSolicitudes = await this.solicitudRepository.find({
      where: {
        idPeriodo: periodId,
        estado: In(activeStatuses),
      },
    });

    const assignmentIds = activeSolicitudes
      .map((solicitud) => solicitud.idAsignacion)
      .filter((id): id is number => id !== null);

    if (assignmentIds.length === 0) {
      return new Map();
    }

    const assignments = await this.asignacionRepository.find({
      where: { idAsignacion: In(assignmentIds) },
    });

    const occupied = new Map<number, number>();
    for (const assignment of assignments) {
      occupied.set(
        assignment.idHabitacion,
        (occupied.get(assignment.idHabitacion) ?? 0) + 1,
      );
    }

    return occupied;
  }

  private genderToGenero(gender: StudentGender): 'Femenino' | 'Masculino' {
    return gender === StudentGender.MUJER ? 'Femenino' : 'Masculino';
  }

  private generoToBuildingId(genero: 'Femenino' | 'Masculino'): BuildingId {
    return genero === 'Femenino' ? BuildingId.FEMENINO : BuildingId.MASCULINO;
  }

  private generoToLabel(genero: 'Femenino' | 'Masculino'): string {
    return genero === 'Femenino' ? 'Edificio Femenino' : 'Edificio Masculino';
  }

  private parseRoomCode(
    roomCode: string,
  ): { floor: number; room: number } | null {
    const clean = roomCode.trim();
    if (!/^\d{3}$/.test(clean)) {
      return null;
    }

    const floor = Number(clean.slice(0, 1));
    const room = Number(clean.slice(1));

    if (floor < 1 || room < 1) {
      return null;
    }

    return { floor, room };
  }

  private toRoomCode(floor: number, room: number): string {
    return `${floor}${room.toString().padStart(2, '0')}`;
  }
}
