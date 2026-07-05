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
  @Get('all')
  async getAll(@Req() request: any) {
    if (!request.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return this.solicitudesService.getAllMySolicitudes(request.user);
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Post()
  async create(@Req() request: any, @Body() body: {}) {
    if (!request.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return this.solicitudesService.createSolicitud(request.user, body);
  }
}
