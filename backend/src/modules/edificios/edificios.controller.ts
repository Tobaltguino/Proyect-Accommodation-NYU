import { Controller, Get, Patch, Body, Param, ParseIntPipe } from '@nestjs/common';
import { EdificiosService } from './edificios.service';

@Controller('edificios')
export class EdificiosController {
  constructor(private readonly edificiosService: EdificiosService) { }

  // GET http://localhost:3000/edificios
  @Get()
  obtenerTodos() {
    return this.edificiosService.obtenerTodos();
  }

  // PATCH http://localhost:3000/edificios/1
  @Patch(':id')
  modificarEdificio(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosActualizados: any
  ) {
    return this.edificiosService.modificarEdificio(id, datosActualizados);
  }
}