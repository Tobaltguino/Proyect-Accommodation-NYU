import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudesAdminDto } from './create-solicitudes-admin.dto';

export class UpdateSolicitudesAdminDto extends PartialType(CreateSolicitudesAdminDto) {}
