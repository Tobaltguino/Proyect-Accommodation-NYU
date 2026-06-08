import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionEntity } from './entities/asignacion.entity';

import { SolicitudEntity } from '../solicitudes/entities';
import { HabitacionEntity } from '../residencias/entities';
import { EdificioEntity } from '../residencias/entities';
import { PisoEntity } from '../residencias/entities';

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

  private async obtenerGeneroEstudiante(rut: string): Promise<string> {
    return 'Masculino'; // o 'Femenino'
  }

  // ---------------------------------------------------------
  // CORE: CREAR ASIGNACIÓN
  // ---------------------------------------------------------
  async crearAsignacion(idSolicitud: number, idHabitacion: number, rutAdmin: string) {

    // 1. Obtener la Solicitud
    const solicitud = await this.solicitudRepo.findOne({ where: { idSolicitud } });
    if (!solicitud) throw new NotFoundException('La solicitud no existe.');
    if (solicitud.estado !== 'Pendiente') throw new BadRequestException('Esta solicitud ya fue procesada.');

    // 2. Obtener la Habitación y su Edificio
    const habitacion = await this.habitacionRepo.findOne({ where: { idHabitacion } });
    if (!habitacion) throw new NotFoundException('La habitación no existe.');

    const piso = await this.pisoRepo.findOne({ where: { idPiso: habitacion.idPiso } });
    if (!piso) throw new NotFoundException('El piso no existe.');

    const edificio = await this.edificioRepo.findOne({ where: { idEdificio: piso.idEdificio } });
    if (!edificio) throw new NotFoundException('El edificio asociado no existe.');

    const rutEstudiante = solicitud.rutEstudiante;

    //---------------------------------------------------------------------
    // IMPORTANTE ACTUALIZAR DESPUES
    //---------------------------------------------------------------------
    // 3. Validar Matrícula (API Externa)
    const tieneMatricula = await this.verificarMatriculaActiva(rutEstudiante);
    if (!tieneMatricula) {
      throw new ForbiddenException('El estudiante no tiene matrícula activa.');
    }

    //---------------------------------------------------------------------
    // IMPORTANTE ACTUALIZAR DESPUES
    //---------------------------------------------------------------------
    // 5. Validar Género (API Externa vs Base de Datos)
    const generoEstudiante = await this.obtenerGeneroEstudiante(rutEstudiante);
    if (edificio.genero !== 'Mixto' && edificio.genero !== generoEstudiante) {
      throw new BadRequestException(`Conflicto de género: Estudiante ${generoEstudiante} no puede ingresar a edificio ${edificio.genero}.`);
    }

    // 6. Validar Capacidad de la Habitación
    if (habitacion.capacidadActual <= 0 || !habitacion.disponibilidad) {
      throw new BadRequestException('La habitación seleccionada no tiene camas disponibles. O no está disponible');
    }

    // ==========================================
    // EJECUCIÓN DE LA ASIGNACIÓN
    // ==========================================

    // A. Crear el registro de Asignación
    const nuevaAsignacion = this.asignacionRepo.create({
      fechaAsignacion: new Date(),
      fechaCheckIn: null,
      fechaCheckOut: null,
      estado: 'Activa',
      idHabitacion: habitacion.idHabitacion,
      idPeriodo: solicitud.idPeriodo,
      rutEstudiante: rutEstudiante,
      rutAdmin: rutAdmin
    });

    const asignacionGuardada = await this.asignacionRepo.save(nuevaAsignacion);

    // B. Actualizar la Solicitud
    solicitud.estado = 'Aprobada';
    solicitud.idAsignacion = asignacionGuardada.idAsignacion;
    await this.solicitudRepo.save(solicitud);

    // C. Actualizar la Habitación
    habitacion.capacidadActual -= 1;
    if (habitacion.capacidadActual === 0) {
      //habitacion.disponibilidad = false;
      //Revisar bien si camas = 0, se cambia su disponibilidad
    }
    await this.habitacionRepo.save(habitacion);

    // D. ========================================================
    // (Plan Alimenticio)


    return {
      message: 'Asignación completada con éxito',
      asignacion: asignacionGuardada
    };
  }

  // OBTENER TODAS LAS ASIGNACIONES
  async obtenerTodas() {
    const asignaciones = await this.asignacionRepo.find({
      relations: {
        periodo: true,
        habitacion: {
          piso: {
            edificio: true
          }
        }
      },

      order: {
        fechaAsignacion: 'DESC'
      }
    });

    return asignaciones.map(asignacion => this.mapAsignacionToDTO(asignacion));

  }

  // OBTENER HISTORIAL COMPLETO DEL ESTUDIANTE ACTUAL
  async obtenerMiHistorial(rutEstudiante: string) {
    const asignaciones = await this.asignacionRepo.find({
      where: { rutEstudiante: rutEstudiante }, // Sin filtro de estado para traer todo el historial
      relations: {
        periodo: true,
        habitacion: {
          piso: {
            edificio: true
          }
        }
      },
      order: { fechaAsignacion: 'DESC' } // Las más recientes primero
    });

    // Reutilizamos el aplanador para mantener el formato plano que el frontend espera
    //return asignaciones
    return asignaciones.map(asignacion => this.mapAsignacionToDTO(asignacion));
  }

  // OBTENER ASIGNACIÓN DEL ESTUDIANTE ACTUAL
  // OBTENER ASIGNACIÓN DEL ESTUDIANTE ACTUAL
  async obtenerMiAsignacion(rutEstudiante: string) {
    const asignacion = await this.asignacionRepo.findOne({
      where: {
        rutEstudiante: rutEstudiante,
        estado: 'Activa'
      },
      // Magia de TypeORM: Traemos el periodo, y bajamos en cascada hasta el edificio
      relations: {
        periodo: true,
        habitacion: {
          piso: {
            edificio: true
          }
        }
      },
      order: { fechaAsignacion: 'DESC' }
    });

    if (!asignacion) {
      return {
        tieneAsignacion: false,
        message: 'No tienes ninguna asignación activa en este momento.'
      };
    }

    return {
      tieneAsignacion: true,
      // AQUÍ USAMOS EL APLANADOR:
      asignacion: this.mapAsignacionToDTO(asignacion)
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
            edificio: true
          }
        }
      },
      order: { fechaAsignacion: 'DESC' }
    });

    // AQUÍ USAMOS EL APLANADOR (Igual que en obtenerTodas):
    return asignaciones.map(asignacion => this.mapAsignacionToDTO(asignacion));
  }

  // ---------------------------------------------------------
  // REASIGNAR HABITACIÓN
  // ---------------------------------------------------------
  async reasignarHabitacion(idAsignacion: number, idNuevaHabitacion: number, rutAdmin: string) {
    // 1. Obtener la asignación actual
    const asignacion = await this.asignacionRepo.findOne({ where: { idAsignacion } });
    if (!asignacion) throw new NotFoundException('La asignación no existe.');
    if (asignacion.estado !== 'Activa') {
      throw new BadRequestException('Solo se pueden reasignar estudiantes que tengan una estadía "Activa".');
    }

    if (asignacion.idHabitacion === idNuevaHabitacion) {
      throw new BadRequestException('El estudiante ya se encuentra en esta habitación.');
    }

    // 2. Obtener la NUEVA Habitación, su Piso y su Edificio
    const nuevaHabitacion = await this.habitacionRepo.findOne({ where: { idHabitacion: idNuevaHabitacion } });
    if (!nuevaHabitacion) throw new NotFoundException('La nueva habitación no existe.');

    const piso = await this.pisoRepo.findOne({ where: { idPiso: nuevaHabitacion.idPiso } });
    if (!piso) throw new NotFoundException('El piso no existe.');

    const edificio = await this.edificioRepo.findOne({ where: { idEdificio: piso.idEdificio } });
    if (!edificio) throw new NotFoundException('El edificio asociado no existe.');

    // 3. Validar Género (Reutilizamos tu método privado)
    const generoEstudiante = await this.obtenerGeneroEstudiante(asignacion.rutEstudiante);
    if (edificio.genero !== 'Mixto' && edificio.genero !== generoEstudiante) {
      throw new BadRequestException(`Conflicto de género: Estudiante ${generoEstudiante} no puede ser reasignado a un edificio ${edificio.genero}.`);
    }

    // 4. Validar Capacidad de la NUEVA Habitación
    if (nuevaHabitacion.capacidadActual <= 0 || !nuevaHabitacion.disponibilidad) {
      throw new BadRequestException('La nueva habitación seleccionada no tiene camas disponibles.');
    }

    // ==========================================
    // EJECUCIÓN DEL INTERCAMBIO (SWAP)
    // ==========================================

    // A. Liberar la cama de la habitación ANTIGUA
    const habitacionAntigua = await this.habitacionRepo.findOne({ where: { idHabitacion: asignacion.idHabitacion } });
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
    const asignacion = await this.asignacionRepo.findOne({ where: { idAsignacion } });

    if (!asignacion) {
      throw new NotFoundException('La asignación no existe.');
    }

    if (asignacion.estado !== 'Activa') {
      throw new BadRequestException('Solo se puede procesar la renuncia de asignaciones que estén en estado "Activa".');
    }

    // 2. Liberar la cama de la habitación
    const habitacion = await this.habitacionRepo.findOne({ where: { idHabitacion: asignacion.idHabitacion } });
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



  private mapAsignacionToDTO(asignacion: any) {
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

      idHabitacion: asignacion.habitacion?.idHabitacion || asignacion.idHabitacion,
      numeroHabitacion: asignacion.habitacion?.nroHabitacion?.toString() || 'Sin asignar',
      nombreEdificio: asignacion.habitacion?.piso?.edificio?.nombre || 'Sin edificio'
    };
  }

  // OBTENER CONTABILIZACIÓN DE ESTUDIANTES RESIDENTES (ACTIVOS) POR PERIODO
  async obtenerTotalResidentesActivos(idPeriodo: number): Promise<{ total: number }> {
    const cantidad = await this.asignacionRepo.count({
      where: {
        estado: 'Activa',
        idPeriodo: idPeriodo
      }
    });

    // Lo devolvemos en formato JSON para que el frontend lo lea directo como "datos.total"
    return { total: cantidad };
  }

}