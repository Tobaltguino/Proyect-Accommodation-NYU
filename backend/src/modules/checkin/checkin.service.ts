import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionEntity } from '../asignaciones/entities/asignacion.entity'; // Ajusta la ruta a tu carpeta
import { HistorialService } from '../historial/historial.service';

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(AsignacionEntity)
    private readonly asignacionRepo: Repository<AsignacionEntity>,
    private readonly historialService: HistorialService,
  ) {}

  async registrarCheckIn(
    idAsignacion: number,
    fechaIngreso: string,
    rutAdmin: string,
  ): Promise<AsignacionEntity> {
    // 1. Buscamos la asignación
    const asignacion = await this.asignacionRepo.findOne({
      where: { idAsignacion },
    });

    if (!asignacion) {
      throw new NotFoundException(
        `La asignación con ID ${idAsignacion} no existe.`,
      );
    }

    // 2. Validamos que la asignación esté activa (no podemos hacer check-in a una cancelada o finalizada)
    if (asignacion.estado !== 'Activa') {
      throw new BadRequestException(
        'Solo se puede realizar el check-in en asignaciones en estado "Activa".',
      );
    }

    // 3. Validamos que el check-in sea NULL (evita que se sobreescriba si ya lo hizo)
    if (asignacion.fechaCheckIn !== null) {
      throw new BadRequestException(
        `El estudiante ya realizó su check-in anteriormente (Fecha registrada: ${asignacion.fechaCheckIn.toISOString()}).`,
      );
    }

    // 4. FORZAR ZONA HORARIA LOCAL
    // Desarmamos el string '2026-06-04' en un arreglo ['2026', '06', '04']
    const partesFecha = fechaIngreso.split('-');

    // Al usar números separados (año, mes, día), JavaScript crea la fecha
    // asumiendo la zona horaria local del servidor por defecto.
    // Nota: El mes se resta en 1 porque en JS los meses van del 0 (Enero) al 11 (Diciembre)
    const fechaLocalSegura = new Date(
      Number(partesFecha[0]),
      Number(partesFecha[1]) - 1,
      Number(partesFecha[2]),
    );

    asignacion.fechaCheckIn = fechaLocalSegura;

    // 5. Guardamos en la base de datos
    const asignacionGuardada = await this.asignacionRepo.save(asignacion);
    await this.historialService.registrarMovimiento({
      tipoMovimiento: 'CHECK_IN',
      rutEstudiante: asignacion.rutEstudiante,
      rutAdmin,
      idAsignacion: asignacion.idAsignacion,
      idHabitacionNueva: asignacion.idHabitacion,
      estadoAnterior: asignacion.estado,
      estadoNuevo: asignacion.estado,
      observacion: 'Ingreso a residencia registrado.',
    });

    return asignacionGuardada;
  }
}
