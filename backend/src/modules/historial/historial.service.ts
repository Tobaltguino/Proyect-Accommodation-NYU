import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, FindOptionsWhere, MoreThanOrEqual, Repository } from 'typeorm';

import { HistorialResidenciaEntity } from './entities';

export type TipoMovimientoHistorial =
  | 'ASIGNACION'
  | 'CHECK_IN'
  | 'REASIGNACION'
  | 'CHECK_OUT'
  | 'RENUNCIA';

export interface RegistrarMovimientoHistorial {
  tipoMovimiento: TipoMovimientoHistorial;
  rutEstudiante: string;
  rutAdmin?: string | null;
  idAsignacion: number;
  idHabitacionAnterior?: number | null;
  idHabitacionNueva?: number | null;
  estadoAnterior?: string | null;
  estadoNuevo?: string | null;
  observacion?: string | null;
}

export interface HistorialAdminFilters {
  rutEstudiante?: string;
  tipoMovimiento?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(HistorialResidenciaEntity)
    private readonly historialRepo: Repository<HistorialResidenciaEntity>,
  ) {}

  async registrarMovimiento(
    data: RegistrarMovimientoHistorial,
    manager?: EntityManager,
  ): Promise<HistorialResidenciaEntity> {
    const repository = manager
      ? manager.getRepository(HistorialResidenciaEntity)
      : this.historialRepo;

    const movimiento = repository.create({
      tipoMovimiento: data.tipoMovimiento,
      fechaMovimiento: new Date(),
      rutEstudiante: data.rutEstudiante,
      rutAdmin: data.rutAdmin ?? null,
      idAsignacion: data.idAsignacion,
      idHabitacionAnterior: data.idHabitacionAnterior ?? null,
      idHabitacionNueva: data.idHabitacionNueva ?? null,
      estadoAnterior: data.estadoAnterior ?? null,
      estadoNuevo: data.estadoNuevo ?? null,
      observacion: data.observacion ?? null,
    });

    return repository.save(movimiento);
  }

  async obtenerMiHistorial(rutEstudiante: string) {
    const movimientos = await this.historialRepo.find({
      where: { rutEstudiante },
      relations: this.historialRelations,
      order: { fechaMovimiento: 'DESC' },
    });

    return movimientos.map((movimiento) => this.mapMovimiento(movimiento));
  }

  async obtenerHistorialAdmin(filters: HistorialAdminFilters) {
    const where: FindOptionsWhere<HistorialResidenciaEntity> = {};

    if (filters.rutEstudiante?.trim()) {
      where.rutEstudiante = filters.rutEstudiante.trim();
    }

    if (this.isTipoMovimiento(filters.tipoMovimiento)) {
      where.tipoMovimiento = filters.tipoMovimiento;
    }

    if (filters.fechaDesde && filters.fechaHasta) {
      where.fechaMovimiento = Between(
        new Date(`${filters.fechaDesde}T00:00:00.000Z`),
        new Date(`${filters.fechaHasta}T23:59:59.999Z`),
      );
    } else if (filters.fechaDesde) {
      where.fechaMovimiento = MoreThanOrEqual(
        new Date(`${filters.fechaDesde}T00:00:00.000Z`),
      );
    }

    const movimientos = await this.historialRepo.find({
      where,
      relations: this.historialRelations,
      order: { fechaMovimiento: 'DESC' },
    });

    return movimientos.map((movimiento) => this.mapMovimiento(movimiento));
  }

  private readonly historialRelations = {
    asignacion: {
      periodo: true,
    },
    habitacionAnterior: {
      piso: {
        edificio: true,
      },
    },
    habitacionNueva: {
      piso: {
        edificio: true,
      },
    },
  };

  private mapMovimiento(movimiento: HistorialResidenciaEntity) {
    return {
      idHistorial: movimiento.idHistorial,
      tipoMovimiento: movimiento.tipoMovimiento,
      fechaMovimiento: movimiento.fechaMovimiento,
      rutEstudiante: movimiento.rutEstudiante,
      rutAdmin: movimiento.rutAdmin,
      idAsignacion: movimiento.idAsignacion,
      idHabitacionAnterior: movimiento.idHabitacionAnterior,
      idHabitacionNueva: movimiento.idHabitacionNueva,
      estadoAnterior: movimiento.estadoAnterior,
      estadoNuevo: movimiento.estadoNuevo,
      observacion: movimiento.observacion,
      idPeriodo: movimiento.asignacion?.periodo?.idPeriodo ?? null,
      nombrePeriodo: movimiento.asignacion?.periodo?.nombre ?? 'Sin periodo',
      habitacionAnterior: this.mapHabitacion(movimiento.habitacionAnterior),
      habitacionNueva: this.mapHabitacion(movimiento.habitacionNueva),
    };
  }

  private isTipoMovimiento(
    value: string | undefined,
  ): value is TipoMovimientoHistorial {
    return (
      value === 'ASIGNACION' ||
      value === 'CHECK_IN' ||
      value === 'REASIGNACION' ||
      value === 'CHECK_OUT' ||
      value === 'RENUNCIA'
    );
  }

  private mapHabitacion(
    habitacion: HistorialResidenciaEntity['habitacionNueva'],
  ) {
    if (!habitacion) {
      return null;
    }

    return {
      idHabitacion: habitacion.idHabitacion,
      numeroHabitacion: habitacion.nroHabitacion.toString(),
      nombreEdificio: habitacion.piso?.edificio?.nombre ?? 'Sin edificio',
    };
  }
}
