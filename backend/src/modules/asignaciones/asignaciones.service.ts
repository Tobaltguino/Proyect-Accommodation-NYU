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
import { PlanAlimenticioEntity } from '../solicitudes/entities';
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
    @InjectRepository(PlanAlimenticioEntity)
    private readonly planRepo: Repository<PlanAlimenticioEntity>,

    private dataSource: DataSource,
  ) { }

  // ---------------------------------------------------------
  // MOCKS DE APIs EXTERNAS (Reemplazar con HTTP Calls reales luego)
  // ---------------------------------------------------------
  private async verificarMatriculaActiva(rut: string): Promise<boolean> {
    // Aquí irá la llamada a la API del otro grupo
    return true;
  }

  private async verificarIncidenciasGraves(rut: string): Promise<boolean> {
    // Retorna 'true' si tiene una incidencia grave activa
    return false;
  }

private async obtenerGeneroEstudiante(rutEstudiante: string): Promise<string> {
    try {
      const usuario = await this.dataSource
        .createQueryBuilder()
        .select('usuario.genero', 'genero')
        // 👇 Asegúrate de que el primer string sea el nombre EXACTO de la tabla en tu BD
        .from('usuario', 'usuario') 
        .where('usuario.rut = :rut', { rut: rutEstudiante })
        .getRawOne();

      if (!usuario || !usuario.genero) {
        throw new BadRequestException(`No se pudo determinar el género del estudiante con RUT ${rutEstudiante}.`);
      }

      return usuario.genero; 
    } catch (error) {
      // Esto imprimirá en tu consola del backend exactamente qué falló (ej. columna no existe)
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
      // 1. Validaciones iniciales (Lecturas)
      const solicitud = await queryRunner.manager.findOne(SolicitudEntity, {
        where: { idSolicitud },
      });
      if (!solicitud) throw new NotFoundException('La solicitud no existe.');
      if (solicitud.estado !== 'Pendiente' && solicitud.estado !== 'En Revision' )
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

      // 2. Validaciones externas
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

      // 3. Ejecución de operaciones (Escritura dentro de la transacción)

      // A. Crear Asignación
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

      // B. Crear Plan Alimenticio
      const nuevoPlan = queryRunner.manager.create(PlanAlimenticioEntity, {
        tipoPlan: solicitud.planAlimenticio,
        idPeriodo: solicitud.idPeriodo,
        rutEstudiante: rutEstudiante, // Asegúrate de tener este campo en la entidad
      });
      await queryRunner.manager.save(nuevoPlan);

      // C. Actualizar Solicitud
      solicitud.estado = 'Aprobada';
      solicitud.idAsignacion = asignacionGuardada.idAsignacion;
      await queryRunner.manager.save(solicitud);

      // D. Actualizar Habitación
      habitacion.capacidadActual -= 1;
      await queryRunner.manager.save(habitacion);

      // Finalizar transacción
      await queryRunner.commitTransaction();

      return {
        message: 'Asignación completada con éxito',
        asignacion: asignacionGuardada,
      };
    } catch (err) {
      // Revertir todo en caso de error
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Liberar conexión
      await queryRunner.release();
    }
  }

  // OBTENER TODAS LAS ASIGNACIONES
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

  // OBTENER HISTORIAL COMPLETO DEL ESTUDIANTE ACTUAL
  async obtenerMiHistorial(rutEstudiante: string): Promise<AsignacionDTO[]> {
    const asignaciones = await this.asignacionRepo.find({
      where: { rutEstudiante: rutEstudiante }, // Sin filtro de estado para traer todo el historial
      relations: {
        periodo: true,
        habitacion: {
          piso: {
            edificio: true,
          },
        },
      },
      order: { fechaAsignacion: 'DESC' }, // Las más recientes primero
    });

    // Reutilizamos el aplanador para mantener el formato plano que el frontend espera
    //return asignaciones
    return asignaciones.map((asignacion) =>
      this.mapAsignacionToDTO(asignacion),
    );
  }

  // OBTENER ASIGNACIÓN DEL ESTUDIANTE ACTUAL
  async obtenerMiAsignacion(rutEstudiante: string): Promise<RespuestaMiAsignacion> {
    const asignacion = await this.asignacionRepo.findOne({
      where: {
        rutEstudiante: rutEstudiante,
        estado: 'Activa',
      },
      // Magia de TypeORM: Traemos el periodo, y bajamos en cascada hasta el edificio
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
        message: 'No tienes ninguna asignación activa en este momento.',
      };
    }

    return {
      tieneAsignacion: true,
      asignacion: this.mapAsignacionToDTO(asignacion),
    };
  }

  // OBTENER ASIGNACIONES POR PERIODO
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

    // AQUÍ USAMOS EL APLANADOR (Igual que en obtenerTodas):
    return asignaciones.map((asignacion) =>
      this.mapAsignacionToDTO(asignacion),
    );
  }

  // REASIGNAR HABITACIÓN
  async reasignarHabitacion(
    idAsignacion: number,
    idNuevaHabitacion: number,
    rutAdmin: string,
  ) {
    // 1. Obtener la asignación actual
    const asignacion = await this.asignacionRepo.findOne({
      where: { idAsignacion },
    });
    if (!asignacion) throw new NotFoundException('La asignación no existe.');
    if (asignacion.estado !== 'Activa') {
      throw new BadRequestException(
        'Solo se pueden reasignar estudiantes que tengan una estadía "Activa".',
      );
    }

    if (asignacion.idHabitacion === idNuevaHabitacion) {
      throw new BadRequestException(
        'El estudiante ya se encuentra en esta habitación.',
      );
    }

    // 2. Obtener la NUEVA Habitación, su Piso y su Edificio
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

    // 3. Validar Género (Reutilizamos tu método privado)
    const generoEstudiante = await this.obtenerGeneroEstudiante(
      asignacion.rutEstudiante,
    );
    if (edificio.genero !== 'Mixto' && edificio.genero !== generoEstudiante) {
      throw new BadRequestException(
        `Conflicto de género: Estudiante ${generoEstudiante} no puede ser reasignado a un edificio ${edificio.genero}.`,
      );
    }

    // 4. Validar Capacidad de la NUEVA Habitación
    if (
      nuevaHabitacion.capacidadActual <= 0 ||
      !nuevaHabitacion.disponibilidad
    ) {
      throw new BadRequestException(
        'La nueva habitación seleccionada no tiene camas disponibles.',
      );
    }

    // ==========================================
    // EJECUCIÓN DEL INTERCAMBIO (SWAP)
    // ==========================================

    // A. Liberar la cama de la habitación ANTIGUA
    const habitacionAntigua = await this.habitacionRepo.findOne({
      where: { idHabitacion: asignacion.idHabitacion },
    });
    if (habitacionAntigua) {
      habitacionAntigua.capacidadActual += 1;
      habitacionAntigua.disponibilidad = true; // Al liberar una cama, vuelve a estar disponible obligatoriamente
      await this.habitacionRepo.save(habitacionAntigua);
    }

    // B. Ocupar la cama de la NUEVA habitación
    nuevaHabitacion.capacidadActual -= 1;
    if (nuevaHabitacion.capacidadActual === 0) {
      nuevaHabitacion.disponibilidad = false; // Se llenó
    }
    await this.habitacionRepo.save(nuevaHabitacion);

    // C. Actualizar la Asignación
    asignacion.idHabitacion = idNuevaHabitacion;
    asignacion.rutAdmin = rutAdmin; // Actualizamos quién fue el responsable del traslado

    return await this.asignacionRepo.save(asignacion);
  }

  async renunciarAsignacion(idAsignacion: number, rutAdmin: string) {
    // 1. Buscamos la asignación
    const asignacion = await this.asignacionRepo.findOne({
      where: { idAsignacion },
    });

    if (!asignacion) {
      throw new NotFoundException('La asignación no existe.');
    }

    if (asignacion.estado !== 'Activa') {
      throw new BadRequestException(
        'Solo se puede procesar la renuncia de asignaciones que estén en estado "Activa".',
      );
    }

    // 2. Liberar la cama de la habitación
    const habitacion = await this.habitacionRepo.findOne({
      where: { idHabitacion: asignacion.idHabitacion },
    });
    if (habitacion) {
      habitacion.capacidadActual += 1;
      habitacion.disponibilidad = true; // Al liberar una cama, la habitación vuelve a estar disponible
      await this.habitacionRepo.save(habitacion);
    }

    // 3. Actualizar los datos de la Asignación
    asignacion.estado = 'Renunciada';

    //REVISAR BIEN FECHAS
    asignacion.fechaCheckOut = new Date(); // La fecha de salida pasa a ser el día de hoy
    asignacion.rutAdmin = rutAdmin; // Registramos qué admin procesó la salida en el sistema

    // 4. Guardamos y retornamos
    return await this.asignacionRepo.save(asignacion);
  }

  // OBTENER CONTABILIZACIÓN DE ESTUDIANTES RESIDENTES (ACTIVOS) POR PERIODO
  async obtenerTotalResidentesActivos(idPeriodo: number): Promise<{ total: number }> {
    const cantidad = await this.asignacionRepo.count({
      where: {
        estado: 'Activa',
        idPeriodo: idPeriodo,
      },
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

      // Relaciones aplanadas de forma segura con ?.
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
