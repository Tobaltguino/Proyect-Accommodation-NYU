import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../auth/enums/role.enum';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { SolicitudesService } from './solicitudes.service';

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Get('status')
  status() {
    return this.solicitudesService.getStatus();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Post()
  async create(@Req() request: any, @Body() body: CreateSolicitudDto) {
    if (!request.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return this.solicitudesService.createSolicitud(request.user, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Get('mia')
  async getMine(@Req() request: any) {
    if (!request.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return this.solicitudesService.getMySolicitud(request.user);
  }
}
