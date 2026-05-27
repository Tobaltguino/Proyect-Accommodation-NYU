// src/modules/check-in/check-in.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionEstanciaEntity } from '../solicitudes/entities'; 

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(AsignacionEstanciaEntity)
    private readonly asignacionRepo: Repository<AsignacionEstanciaEntity>,
  ) {}

  private limpiarRut(rut: string): string {
    return rut.replace(/\./g, '').replace(/-/g, '').trim();
  }

  async obtenerDatosAsignacion(rutOriginal: string) {
    const rutLimpio = this.limpiarRut(rutOriginal);


// ... dentro de tu check-in.service.ts
const asignacion = await this.asignacionRepo.createQueryBuilder('asignacion')
      .innerJoin('habitacion', 'h', 'h.id_habitacion = asignacion.idHabitacion')
      .innerJoin('piso', 'piso', 'piso.id_piso = h.id_piso')
      .innerJoin('edificio', 'e', 'e.id_edificio = piso.id_edificio')
      .innerJoin('periodo', 'p', 'p.id_periodo = asignacion.idPeriodo')
      .select([
        'asignacion.idAsignacion',
        'asignacion.fechaAsignacion',
        'asignacion.fechaCheckIn',
        'asignacion.fechaCheckOut',
        'asignacion.estado',
        'asignacion.idHabitacion',
        'asignacion.idPeriodo',
        'asignacion.rutEstudiante',
        'h.nro_habitacion AS numero_habitacion', 
        // CORRECCIÓN: Cambiamos e.nombre_edificio por e.nombre
        'e.nombre AS nombre_edificio', 
        'p.nombre AS nombre_periodo'
      ])
      .where('asignacion.rut_estudiante = :rutLimpio', { rutLimpio }) 
      .andWhere('asignacion.estado = :estado', { estado: 'Activa' })
      .getRawOne();
    if (!asignacion) {
      throw new NotFoundException(`No se encontró una asignación activa para el RUT: ${rutOriginal}`);
    }

    // Devolvemos el JSON estructurado al Frontend con los nombres de las variables de tu entidad
    return {
      id_asignacion: asignacion.asignacion_id_asignacion,
      fecha_asignacion: asignacion.asignacion_fecha_asignacion,
      fecha_check_in: asignacion.asignacion_fecha_check_in,
      fecha_check_out: asignacion.asignacion_fecha_check_out,
      estado: asignacion.asignacion_estado,
      id_habitacion: asignacion.asignacion_id_habitacion,
      id_periodo: asignacion.asignacion_id_periodo,
      rut_estudiante: rutOriginal,
      
      // Mock para tus compañeros
      nombre_estudiante: 'Estudiante de Prueba (API Externa no conectada)', 
      
      // Aquí caen los nombres que rescatamos con los INNER JOINs
      nombre_periodo: asignacion.nombre_periodo ?? null,
      numero_habitacion: asignacion.numero_habitacion ?? null,
      nombre_edificio: asignacion.nombre_edificio ?? null,
    };
  }
}