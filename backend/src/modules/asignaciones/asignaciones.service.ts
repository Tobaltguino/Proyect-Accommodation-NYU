import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionEntity } from './entities/asignacion.entity';

import { SolicitudEntity } from '../solicitudes/entities';
import { HabitacionEntity } from '../residencias/entities';
import { EdificioEntity } from '../residencias/entities';
import { PisoEntity } from '../residencias/entities';
import { DataSource } from 'typeorm';
import { AsignacionDTO, RespuestaMiAsignacion } from './dto/asignacion.dto';

@Injectable()
export class AsignacionesService {
  constructor(
    @InjectRepository(AsignacionEntity)
    private readonly asignacionRepo: Repository<AsignacionEntity>,
    @InjectRepository(SolicitudEntity)
    private readonly solicitudRepo: Repository<SolicitudEntity>,
    @InjectRepository(HabitacionEntity)
    private readonly habitacionRepo: Repository<HabitacionEntity>,
    @InjectRepository(EdificioEntity)
    private readonly edificioRepo: Repository<EdificioEntity>,
    @InjectRepository(PisoEntity)
    private readonly pisoRepo: Repository<PisoEntity>,

    private dataSource: DataSource,
  ) {}

  private async verificarMatriculaActiva(rut: string): Promise<boolean> {
    return true;
  }

  private async verificarIncidenciasGraves(rut: string): Promise<boolean> {
    return false;
  }

  private async obtenerGeneroEstudiante(
    rutEstudiante: string,
  ): Promise<string> {
    try {
      const usuario = await this.dataSource
        .createQueryBuilder()
        .select('usuario.genero', 'genero')
        .from('usuario', 'usuario')
        .where('usuario.rut = :rut', { rut: rutEstudiante })
        .getRawOne();

      if (!usuario || !usuario.genero) {
        throw new BadRequestException(
          `No se pudo determinar el género del estudiante con RUT ${rutEstudiante}.`,
        );
      }

      return usuario.genero;
    } catch (error) {
      console.error('💥 Error en obtenerGeneroEstudiante:', error);
      throw error;
    }
  }

  async crearAsignacion(
    idSolicitud: number,
    idHabitacion: number,
    rutAdmin: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const solicitud = await queryRunner.manager.findOne(SolicitudEntity, {
        where: { idSolicitud },
      });
      if (!solicitud) throw new NotFoundException('La solicitud no existe.');
      if (
        solicitud.estado !== 'Pendiente' &&
        solicitud.estado !== 'En Revision'
      )
        throw new BadRequestException('Esta solicitud ya fue procesada.');

      const habitacion = await queryRunner.manager.findOne(HabitacionEntity, {
        where: { idHabitacion },
      });
      if (!habitacion) throw new NotFoundException('La habitación no existe.');

      const piso = await queryRunner.manager.findOne(PisoEntity, {
        where: { idPiso: habitacion.idPiso },
      });
      if (!piso) throw new NotFoundException('El piso no existe.');

      const edificio = await queryRunner.manager.findOne(EdificioEntity, {
        where: { idEdificio: piso.idEdificio },
      });
      if (!edificio)
        throw new NotFoundException('El edificio asociado no existe.');

      const rutEstudiante = solicitud.rutEstudiante;

      const tieneMatricula = await this.verificarMatriculaActiva(rutEstudiante);
      if (!tieneMatricula)
        throw new ForbiddenException(
          'El estudiante no tiene matrícula activa.',
        );

      const generoEstudiante =
        await this.obtenerGeneroEstudiante(rutEstudiante);
      if (edificio.genero !== 'Mixto' && edificio.genero !== generoEstudiante) {
        throw new BadRequestException(
          `Conflicto de género: Estudiante ${generoEstudiante} no puede ingresar a edificio ${edificio.genero}.`,
        );
      }

      if (habitacion.capacidadActual <= 0 || !habitacion.disponibilidad) {
        throw new BadRequestException(
          'La habitación seleccionada no tiene camas disponibles.',
        );
      }

      const nuevaAsignacion = queryRunner.manager.create(AsignacionEntity, {
        fechaAsignacion: new Date(),
        estado: 'Activa',
        idHabitacion: habitacion.idHabitacion,
        idPeriodo: solicitud.idPeriodo,
        rutEstudiante: rutEstudiante,
        rutAdmin: rutAdmin,
      });
      const asignacionGuardada =
        await queryRunner.manager.save(nuevaAsignacion);
      await queryRunner.manager.save(nuevoPlan);

      solicitud.estado = 'Aprobada';
      solicitud.idAsignacion = asignacionGuardada.idAsignacion;
      await queryRunner.manager.save(solicitud);

      habitacion.capacidadActual -= 1;
      await queryRunner.manager.save(habitacion);

      await queryRunner.commitTransaction();

      return {
        message: 'Asignación completada con éxito',
        asignacion: asignacionGuardada,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async obtenerTodas(): Promise<AsignacionDTO[]> {
    const asignaciones = await this.asignacionRepo.find({
      relations: {
        periodo: true,
        habitacion: {
          piso: {
            edificio: true,
          },
        },
      },
      order: {
        fechaAsignacion: 'DESC',
      },
    });

    return asignaciones.map((asignacion) =>
      this.mapAsignacionToDTO(asignacion),
    );
  }

  async obtenerMiHistorial(rutEstudiante: string): Promise<AsignacionDTO[]> {
    const asignaciones = await this.asignacionRepo.find({
      where: { rutEstudiante: rutEstudiante },
      relations: {
        periodo: true,
        habitacion: {
          piso: {
            edificio: true,
          },
        },
      },
      order: { fechaAsignacion: 'DESC' },
    });

    return asignaciones.map((asignacion) =>
      this.mapAsignacionToDTO(asignacion),
    );
  }

  async obtenerMiAsignacion(
    rutEstudiante: string,
  ): Promise<RespuestaMiAsignacion> {
    const asignacion = await this.asignacionRepo.findOne({
      where: { rutEstudiante: rutEstudiante, estado: 'Activa' },
      relations: {
        periodo: true,
        habitacion: {
          piso: {
            edificio: true,
          },
        },
      },
      order: { fechaAsignacion: 'DESC' },
    });

    if (!asignacion) {
      return {
        tieneAsignacion: false,
        message: 'No se encontró ninguna estancia vigente para este residente.',
      };
    }

    return {
      tieneAsignacion: true,
      asignacion: this.mapAsignacionToDTO(asignacion),
    };
  }

  async obtenerPorPeriodo(idPeriodo: number) {
    const asignaciones = await this.asignacionRepo.find({
      where: { idPeriodo: idPeriodo },
      relations: {
        periodo: true,
        habitacion: {
          piso: {
            edificio: true,
          },
        },
      },
      order: { fechaAsignacion: 'DESC' },
    });

    return asignaciones.map((asignacion) =>
      this.mapAsignacionToDTO(asignacion),
    );
  }

  async reasignarHabitacion(
    idAsignacion: number,
    idNuevaHabitacion: number,
    rutAdmin: string,
  ) {
    const asignacion = await this.asignacionRepo.findOne({
      where: { idAsignacion },
    });
    if (!asignacion) throw new NotFoundException('La asignación no existe.');
    if (asignacion.estado !== 'Activa') {
      throw new BadRequestException(
        'Solo se pueden reasignar estudiantes que tengan una estadía vigente.',
      );
    }

    if (asignacion.idHabitacion === idNuevaHabitacion) {
      throw new BadRequestException(
        'El estudiante ya se encuentra en esta habitación.',
      );
    }

    const nuevaHabitacion = await this.habitacionRepo.findOne({
      where: { idHabitacion: idNuevaHabitacion },
    });
    if (!nuevaHabitacion)
      throw new NotFoundException('La nueva habitación no existe.');

    const piso = await this.pisoRepo.findOne({
      where: { idPiso: nuevaHabitacion.idPiso },
    });
    if (!piso) throw new NotFoundException('El piso no existe.');

    const edificio = await this.edificioRepo.findOne({
      where: { idEdificio: piso.idEdificio },
    });
    if (!edificio)
      throw new NotFoundException('El edificio asociado no existe.');

    const generoEstudiante = await this.obtenerGeneroEstudiante(
      asignacion.rutEstudiante,
    );
    if (edificio.genero !== 'Mixto' && edificio.genero !== generoEstudiante) {
      throw new BadRequestException(
        `Conflicto de género: Estudiante ${generoEstudiante} no puede ser reasignado a un edificio ${edificio.genero}.`,
      );
    }

    if (
      nuevaHabitacion.capacidadActual <= 0 ||
      !nuevaHabitacion.disponibilidad
    ) {
      throw new BadRequestException(
        'La nueva habitación seleccionada no tiene camas disponibles.',
      );
    }

    const habitacionAntigua = await this.habitacionRepo.findOne({
      where: { idHabitacion: asignacion.idHabitacion },
    });
    if (habitacionAntigua) {
      habitacionAntigua.capacidadActual += 1;
      habitacionAntigua.disponibilidad = true;
      await this.habitacionRepo.save(habitacionAntigua);
    }

    nuevaHabitacion.capacidadActual -= 1;
    if (nuevaHabitacion.capacidadActual === 0) {
      nuevaHabitacion.disponibilidad = false;
    }
    await this.habitacionRepo.save(nuevaHabitacion);

    asignacion.idHabitacion = idNuevaHabitacion;
    asignacion.rutAdmin = rutAdmin;

    return await this.asignacionRepo.save(asignacion);
  }

  async renunciarAsignacion(idAsignacion: number, rutAdmin: string) {
    const asignacion = await this.asignacionRepo.findOne({
      where: { idAsignacion },
    });

    if (!asignacion) {
      throw new NotFoundException('La asignación no existe.');
    }

    if (asignacion.estado !== 'Activa') {
      throw new BadRequestException(
        'Solo se puede procesar la renuncia de asignaciones que estén vigentes.',
      );
    }

    const habitacion = await this.habitacionRepo.findOne({
      where: { idHabitacion: asignacion.idHabitacion },
    });
    if (habitacion) {
      habitacion.capacidadActual += 1;
      habitacion.disponibilidad = true;
      await this.habitacionRepo.save(habitacion);
    }

    const hoy = new Date();
    const fechaLocal = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    asignacion.estado = 'Renunciada';
    asignacion.fechaCheckOut = fechaLocal as any;
    asignacion.rutAdmin = rutAdmin;

    return await this.asignacionRepo.save(asignacion);
  }

  async registrarCheckIn(idAsignacion: number, rutAdmin: string) {
    try {
      const asignacion = await this.asignacionRepo.findOne({
        where: { idAsignacion },
      });
      if (!asignacion) throw new NotFoundException('La asignación no existe.');
      if (asignacion.estado !== 'Activa')
        throw new BadRequestException(
          'La asignación no está pendiente de ingreso.',
        );

      const hoy = new Date();
      const fechaLocal = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

      asignacion.fechaCheckIn = fechaLocal as any;
      asignacion.rutAdmin = rutAdmin;

      return await this.asignacionRepo.save(asignacion);
    } catch (error) {
      console.error('💥 Error CRÍTICO en registrarCheckIn:', error);
      throw error;
    }
  }

  async registrarCheckOut(idAsignacion: number, rutAdmin: string) {
    try {
      const asignacion = await this.asignacionRepo.findOne({
        where: { idAsignacion },
      });
      if (!asignacion) throw new NotFoundException('La asignación no existe.');
      if (asignacion.estado !== 'Activa')
        throw new BadRequestException(
          'Solo se puede hacer Check-Out a residentes activos.',
        );
      if (!asignacion.fechaCheckIn)
        throw new BadRequestException(
          'El estudiante aún no ha realizado el Check-In.',
        );

      const habitacion = await this.habitacionRepo.findOne({
        where: { idHabitacion: asignacion.idHabitacion },
      });
      if (habitacion) {
        habitacion.capacidadActual += 1;
        habitacion.disponibilidad = true;
        await this.habitacionRepo.save(habitacion);
      }

      const hoy = new Date();
      const fechaLocal = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

      asignacion.estado = 'Finalizada';
      asignacion.fechaCheckOut = fechaLocal as any;
      asignacion.rutAdmin = rutAdmin;

      return await this.asignacionRepo.save(asignacion);
    } catch (error) {
      console.error('💥 Error CRÍTICO en registrarCheckOut:', error);
      throw error;
    }
  }

  async obtenerTotalResidentesActivos(
    idPeriodo: number,
  ): Promise<{ total: number }> {
    const cantidad = await this.asignacionRepo.count({
      where: { estado: 'Activa', idPeriodo: idPeriodo },
    });
    return { total: cantidad };
  }

  private mapAsignacionToDTO(asignacion: any): AsignacionDTO {
    return {
      idAsignacion: asignacion.idAsignacion,
      fechaAsignacion: asignacion.fechaAsignacion,
      fechaCheckIn: asignacion.fechaCheckIn,
      fechaCheckOut: asignacion.fechaCheckOut,
      estado: asignacion.estado,
      rutEstudiante: asignacion.rutEstudiante,
      rutAdmin: asignacion.rutAdmin,

      idPeriodo: asignacion.periodo?.idPeriodo || asignacion.idPeriodo,
      nombrePeriodo: asignacion.periodo?.nombre || 'Sin periodo',

      idHabitacion:
        asignacion.habitacion?.idHabitacion || asignacion.idHabitacion,
      numeroHabitacion:
        asignacion.habitacion?.nroHabitacion?.toString() || 'Sin asignar',
      nombreEdificio:
        asignacion.habitacion?.piso?.edificio?.nombre || 'Sin edificio',
    };
  }
}
