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
  async obtenerTodas(): Promise<AsignacionEntity[]> {
    return await this.asignacionRepo.find({
      order: {
        fechaAsignacion: 'DESC' // Las más recientes primero
      }
    });
  }

  // OBTENER ASIGNACIÓN DEL ESTUDIANTE ACTUAL
  async obtenerMiAsignacion(rutEstudiante: string) {
    const asignacion = await this.asignacionRepo.findOne({
      where: {
        rutEstudiante: rutEstudiante,
        estado: 'Activa'
      },
      order: { fechaAsignacion: 'DESC' } // Por si acaso hubiera un historial, tomamos la más reciente
    });

    if (!asignacion) {
      return {
        tieneAsignacion: false,
        message: 'No tienes ninguna asignación activa en este momento.'
      };
    }

    return {
      tieneAsignacion: true,
      asignacion: asignacion
    };
  }

  // OBTENER ASIGNACIONES POR PERIODO
  async obtenerPorPeriodo(idPeriodo: number): Promise<AsignacionEntity[]> {
    return await this.asignacionRepo.find({
      where: { idPeriodo: idPeriodo },
      order: { fechaAsignacion: 'DESC' }
    });
  }

}