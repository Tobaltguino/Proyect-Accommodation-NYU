import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EdificioEntity } from '../residencias/entities';

@Injectable()
export class EdificiosService {
  constructor(
    @InjectRepository(EdificioEntity)
    private readonly edificioRepo: Repository<EdificioEntity>,
  ) {}

  // 1. OBTENER TODOS LOS EDIFICIOS
  async obtenerTodos(): Promise<EdificioEntity[]> {
    return await this.edificioRepo.find({
      order: { idEdificio: 'ASC' }, // Ordenados por ID para que la lista siempre sea consistente
    });
  }

  // 2. MODIFICAR EDIFICIO (Actualización Parcial)
  async modificarEdificio(
    idEdificio: number,
    datosActualizados: Partial<EdificioEntity>,
  ): Promise<EdificioEntity> {
    const edificio = await this.edificioRepo.findOne({
      where: { idEdificio },
    });

    if (!edificio) {
      throw new NotFoundException(
        `El edificio con ID ${idEdificio} no existe en la base de datos.`,
      );
    }

    // Actualizamos solo los campos que el frontend nos envíe (ej. capacidad o nombre)
    Object.assign(edificio, datosActualizados);

    return await this.edificioRepo.save(edificio);
  }

  // 3. OBTENER EDIFICIOS POR GÉNERO
  // =========================================================
  // OBTENER EDIFICIOS POR GÉNERO
  // =========================================================
  async obtenerPorGenero(genero: string) {
    const edificios = await this.edificioRepo.find({
      where: { genero: genero },
      // Si quisieras que el totalPisos del DTO funcione, descomenta la siguiente línea:
      relations: { pisos: true },
      order: { nombre: 'ASC' },
    });

    return edificios.map((edificio) => this.mapEdificioToDTO(edificio));
  }

  async obtenerInfraestructuraCompleta(): Promise<EdificioEntity[]> {
    return await this.edificioRepo.find({
      relations: {
        pisos: {
          habitaciones: true, // Trae las habitaciones dentro de cada piso
        },
      },
      order: {
        idEdificio: 'ASC',
        pisos: {
          nroPiso: 'ASC',
          habitaciones: {
            nroHabitacion: 'ASC',
          },
        },
      },
    });
  }

  async obtenerInfraestructuraCompletaPorGenero(
    genero: string,
  ): Promise<EdificioEntity[]> {
    return await this.edificioRepo.find({
      relations: {
        pisos: {
          habitaciones: true, // Trae las habitaciones dentro de cada piso
        },
      },
      where: { genero: genero },
      order: {
        idEdificio: 'ASC',
        pisos: {
          nroPiso: 'ASC',
          habitaciones: {
            nroHabitacion: 'ASC',
          },
        },
      },
    });
  }

  // =========================================================
  // LA HERRAMIENTA APLANADORA DE EDIFICIOS
  // =========================================================
  private mapEdificioToDTO(edificio: any) {
    return {
      idEdificio: edificio.idEdificio,
      nombre: edificio.nombre,
      ubicacion: edificio.ubicacion,
      capacidadHabitaciones: edificio.capacidadHabitaciones,
      genero: edificio.genero,

      // Si en alguna ruta futura decides traer la relación de pisos,
      // esto le enviará al frontend un número limpio con el total de pisos
      totalPisos: edificio.pisos ? edificio.pisos.length : 0,
    };
  }
}
