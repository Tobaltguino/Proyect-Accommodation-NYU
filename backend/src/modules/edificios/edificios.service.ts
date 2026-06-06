import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EdificioEntity } from '../residencias/entities';

@Injectable()
export class EdificiosService {
  constructor(
    @InjectRepository(EdificioEntity)
    private readonly edificioRepo: Repository<EdificioEntity>,
  ) { }

  // 1. OBTENER TODOS LOS EDIFICIOS
  async obtenerTodos(): Promise<EdificioEntity[]> {
    return await this.edificioRepo.find({
      order: { idEdificio: 'ASC' } // Ordenados por ID para que la lista siempre sea consistente
    });
  }

  // 2. MODIFICAR EDIFICIO (Actualización Parcial)
  async modificarEdificio(idEdificio: number, datosActualizados: Partial<EdificioEntity>): Promise<EdificioEntity> {
    const edificio = await this.edificioRepo.findOne({
      where: { idEdificio }
    });

    if (!edificio) {
      throw new NotFoundException(`El edificio con ID ${idEdificio} no existe en la base de datos.`);
    }

    // Actualizamos solo los campos que el frontend nos envíe (ej. capacidad o nombre)
    Object.assign(edificio, datosActualizados);

    return await this.edificioRepo.save(edificio);
  }

  // 3. OBTENER EDIFICIOS POR GÉNERO
  async obtenerPorGenero(genero: string): Promise<EdificioEntity[]> {
    return await this.edificioRepo.find({
      where: { genero: genero },
      order: { idEdificio: 'ASC' }
    });
  }


}