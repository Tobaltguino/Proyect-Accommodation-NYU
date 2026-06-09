import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IncidenciasService } from './incidencias.service';
import { CreateIncidenciaDto, IncidenciaQueryDto, UpdateIncidenciaEstadoDto } from './dto';

@Controller('incidencias')
export class IncidenciasController {
  constructor(private readonly incidenciasService: IncidenciasService) {}

  @Get('status')
  status() {
    return this.incidenciasService.getStatus();
  }

  @Post()
  create(@Body() body: CreateIncidenciaDto) {
    return this.incidenciasService.createIncidencia(body);
  }

  @Get()
  findAll(@Query() query: IncidenciaQueryDto) {
    return this.incidenciasService.getIncidencias(query);
  }

  @Patch(':id/estado')
  updateEstado(@Param('id') id: string, @Body() body: UpdateIncidenciaEstadoDto) {
    return this.incidenciasService.updateEstadoIncidencia(Number(id), body);
  }
}
