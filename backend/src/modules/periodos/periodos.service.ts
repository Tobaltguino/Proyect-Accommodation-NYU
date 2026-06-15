import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { PeriodoEntity } from './entities/periodo.entity';

@Injectable()
export class PeriodosService {
  constructor(
    @InjectRepository(PeriodoEntity)
    private readonly periodoRepository: Repository<PeriodoEntity>,
  ) {}

  // 1. Obtener todos los periodos (para que el Admin los vea en el dropdown)
  async obtenerTodos(): Promise<PeriodoEntity[]> {
    return await this.periodoRepository.find({
      order: { fechaInicio: 'DESC' }, // Ordenamos por fecha para que el Admin vea lo más nuevo arriba
    });
  }

  // 2. Lógica del Periodo Actual (Basada en el intervalo de tiempo real)
  async obtenerActual(): Promise<PeriodoEntity> {
    // Obtenemos la fecha de hoy en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split('T')[0];

    // Buscamos el periodo donde: fecha_inicio <= hoy <= fecha_termino
    const periodoActual = await this.periodoRepository.findOne({
      where: {
        fechaInicio: LessThanOrEqual(hoy),
        fechaTermino: MoreThanOrEqual(hoy),
      },
    });

    // MANEJO DE EXCEPCIÓN: ¿Qué pasa si hoy es 15 de Julio y no hay semestre activo?
    if (!periodoActual) {
      // Buscamos el periodo que terminó más recientemente
      const ultimo = await this.periodoRepository.find({
        order: { fechaTermino: 'DESC' },
        take: 1,
      });

      if (ultimo.length === 0) {
        throw new NotFoundException(
          'No existen periodos configurados en la base de datos.',
        );
      }

      return ultimo[0];
    }

    return periodoActual;
  }
}
