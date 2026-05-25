import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PisoEntity } from '../residencias/entities';

@Injectable()
export class PisosService {
  constructor(
    @InjectRepository(PisoEntity)
    private readonly pisoRepo: Repository<PisoEntity>,
  ) { }

  // 1. CREAR PISO
  async crearPiso(nroPiso: number, nombre: string, idEdificio: number): Promise<PisoEntity> {
    // .create() prepara el objeto en memoria
    const nuevoPiso = this.pisoRepo.create({
      nroPiso,
      nombre,
      idEdificio,
    });


    // .save() lo inserta en Supabase
    return await this.pisoRepo.save(nuevoPiso);
  }

  // 2. ELIMINAR PISO
  async eliminarPiso(idPiso: number) {
    // Primero verificamos que el piso realmente exista
    const piso = await this.pisoRepo.findOne({
      where: { idPiso: idPiso }
    });

    if (!piso) {
      throw new NotFoundException(`El piso con ID ${idPiso} no se encontró en la base de datos.`);
    }

    // Si existe, lo eliminamos
    await this.pisoRepo.remove(piso);

    // Devolvemos un mensaje de éxito para que el frontend sepa que todo salió bien
    return {
      statusCode: 200,
      message: `El piso '${piso.nombre}' fue eliminado correctamente.`
    };
  }
}