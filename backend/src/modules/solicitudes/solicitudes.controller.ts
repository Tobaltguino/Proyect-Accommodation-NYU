import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';
import { Role } from '../auth/enums/role.enum';
import { CreateSolicitudDto } from './dto';
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
  create(@Req() request: AuthenticatedRequest, @Body() body: CreateSolicitudDto) {
    if (!request.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return this.solicitudesService.createSolicitud(request.user, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Get('mia')
  getMine(@Req() request: AuthenticatedRequest, @Query('semester') semester?: string) {
    if (!request.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return this.solicitudesService.getMySolicitud(request.user, semester);
  }
}
