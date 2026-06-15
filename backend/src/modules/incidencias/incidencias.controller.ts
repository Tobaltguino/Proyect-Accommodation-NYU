import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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
  create(@Body() body: CreateIncidenciaDto) {
    return this.incidenciasService.createIncidencia(body);
  }

  @Get()
  findAll(@Query() query: IncidenciaQueryDto) {
    return this.incidenciasService.getIncidencias(query);
  }

  @Get('evaluacion/:rutEstudiante')
  getEvaluacion(@Param('rutEstudiante') rutEstudiante: string) {
    return this.incidenciasService.getEvaluacionResidencial(rutEstudiante);
  }
}
