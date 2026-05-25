import { Controller, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PisosService } from './pisos.service';

@Controller('pisos')
export class PisosController {
  constructor(private readonly pisosService: PisosService) { }

  // POST http://localhost:3000/pisos
  @Post()
  crearPiso(
    @Body('nroPiso') nroPiso: number,
    @Body('nombre') nombre: string,
    @Body('idEdificio') idEdificio: number,
  ) {
    return this.pisosService.crearPiso(nroPiso, nombre, idEdificio);
  }

  // DELETE http://localhost:3000/pisos/5
  @Delete(':id')
  eliminarPiso(@Param('id', ParseIntPipe) idPiso: number) {
    return this.pisosService.eliminarPiso(idPiso);
  }
}