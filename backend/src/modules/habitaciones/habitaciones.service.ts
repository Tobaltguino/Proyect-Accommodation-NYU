import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HabitacionEntity } from '../residencias/entities';

@Injectable()
export class HabitacionesService {
  constructor(
    @InjectRepository(HabitacionEntity)
    private readonly habitacionRepo: Repository<HabitacionEntity>,
  ) { }

  // 1. CREAR HABITACIÓN
  async crearHabitacion(
    nroHabitacion: number,
    capacidadActual: number,
    disponibilidad: boolean,
    idPiso: number
  ): Promise<HabitacionEntity> {
    const nuevaHabitacion = this.habitacionRepo.create({
      nroHabitacion,
      capacidadActual,
      disponibilidad,
      idPiso,
    });

    return await this.habitacionRepo.save(nuevaHabitacion);
  }

  // 2. MODIFICAR HABITACIÓN (Actualización Parcial)
  async modificarHabitacion(idHabitacion: number, datosActualizados: Partial<HabitacionEntity>) {
    const habitacion = await this.habitacionRepo.findOne({
      where: { idHabitacion }
    });

    if (!habitacion) {
      throw new NotFoundException(`La habitación con ID ${idHabitacion} no existe.`);
    }

    // Object.assign fusiona los datos viejos con los nuevos que acaban de llegar
    Object.assign(habitacion, datosActualizados);

    return await this.habitacionRepo.save(habitacion);
  }

  // 3. ELIMINAR HABITACIÓN
  async eliminarHabitacion(idHabitacion: number) {
    const habitacion = await this.habitacionRepo.findOne({
      where: { idHabitacion }
    });

    if (!habitacion) {
      throw new NotFoundException(`La habitación con ID ${idHabitacion} no existe.`);
    }

    await this.habitacionRepo.remove(habitacion);

    return {
      statusCode: 200,
      message: `La habitación número ${habitacion.nroHabitacion} fue eliminada correctamente.`
    };
  }

  // Obtener pisos por edificio
  async obtenerPorEdificio(idEdificio: number): Promise<HabitacionEntity[]> {
    return await this.habitacionRepo.createQueryBuilder('habitacion')
      .innerJoin('piso', 'piso', 'piso.id_piso = habitacion.id_piso')
      .where('piso.id_edificio = :idEdificio', { idEdificio })
      .getMany();
  }

  async obtenerTodasConPiso(): Promise<HabitacionEntity[]> {
    return await this.habitacionRepo.find({
      relations: ['piso'], // Aquí ocurre la magia
      order: {
        idPiso: 'ASC',
        nroHabitacion: 'ASC'
      }
    });
  }

  // OBTENER TODAS LAS HABITACIONES
  async obtenerTodas(): Promise<HabitacionEntity[]> {
    return await this.habitacionRepo.find({
      order: {
        idPiso: 'ASC',
        nroHabitacion: 'ASC'
      }
    });
  }

  async obtenerTotalDisponibles(): Promise<{ total: number }> {
    const cantidad = await this.habitacionRepo.createQueryBuilder('habitacion')
      .where('habitacion.disponibilidad = :disponibilidad', { disponibilidad: true })
      .andWhere('habitacion.capacidad_actual > :min', { min: 0 })
      .andWhere('habitacion.capacidad_actual <= habitacion.capacidad_total')
      .getCount();

    // Lo devolvemos como un objeto JSON para que el frontend lo procese fácilmente
    return { total: cantidad };
  }


}