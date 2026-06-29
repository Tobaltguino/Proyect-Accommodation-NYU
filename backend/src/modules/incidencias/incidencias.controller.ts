import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../auth/enums/role.enum';
import { IncidenciasService } from './incidencias.service';
import { CreateIncidenciaDto, IncidenciaQueryDto } from './dto';

@Controller('incidencias')
export class IncidenciasController {
  constructor(private readonly incidenciasService: IncidenciasService) {}

  @Get('status')
  status() {
    return this.incidenciasService.getStatus();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() body: CreateIncidenciaDto) {
    return this.incidenciasService.createIncidencia(body);
  }

  @Get()
  findAll(@Query() query: IncidenciaQueryDto) {
    return this.incidenciasService.getIncidencias(query);
  }
}
