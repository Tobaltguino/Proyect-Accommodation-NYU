import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudesAdminDto } from './create-solicitudes-admin.dto';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { SolicitudStatus } from '../../solicitudes/enums/solicitud.enums';
export class UpdateSolicitudesAdminDto {
  @IsEnum(SolicitudStatus, {
    message:
      'El estado debe ser un valor válido (Pendiente, Aprobado, Rechazado, etc.)',
  })
  @IsNotEmpty({ message: 'El estado es requerido' })
  estado!: SolicitudStatus;
}
