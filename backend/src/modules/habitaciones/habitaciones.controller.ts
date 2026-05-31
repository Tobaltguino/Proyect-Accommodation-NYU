import { Controller, Post, Patch, Delete, Body, Param, ParseIntPipe, Get } from '@nestjs/common';
import { HabitacionesService } from './habitaciones.service';
// Si tienes un DTO, lo ideal es usarlo en el @Body() del Patch, 
// pero usaremos 'any' o un objeto para mantenerlo funcional rápidamente.

@Controller('habitaciones')
export class HabitacionesController {
  constructor(private readonly habitacionesService: HabitacionesService) { }

  // POST http://localhost:3000/habitaciones
  @Post()
  crearHabitacion(
    @Body('nroHabitacion') nroHabitacion: number,
    @Body('capacidadActual') capacidadActual: number,
    @Body('disponibilidad') disponibilidad: boolean,
    @Body('idPiso') idPiso: number,
  ) {
    return this.habitacionesService.crearHabitacion(nroHabitacion, capacidadActual, disponibilidad, idPiso);
  }

  // PATCH http://localhost:3000/habitaciones/5
  @Patch(':id')
  modificarHabitacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosActualizados: any // Recibe cualquier campo de HabitacionEntity
  ) {
    return this.habitacionesService.modificarHabitacion(id, datosActualizados);
  }

  // DELETE http://localhost:3000/habitaciones/5
  @Delete(':id')
  eliminarHabitacion(@Param('id', ParseIntPipe) id: number) {
    return this.habitacionesService.eliminarHabitacion(id);
  }

  // GET http://localhost:3000/habitaciones/edificio/1
  @Get('edificio/:idEdificio')
  obtenerPorEdificio(@Param('idEdificio', ParseIntPipe) idEdificio: number) {
    return this.habitacionesService.obtenerPorEdificio(idEdificio);
  }

  //TEMPORAL QUIZAS
  // GET http://localhost:3000/habitaciones/detalles
  @Get('detalles')
  obtenerTodasConPiso() {
    return this.habitacionesService.obtenerTodasConPiso();
  }

  // GET http://localhost:3000/habitaciones
  @Get()
  obtenerTodas() {
    return this.habitacionesService.obtenerTodas();
  }

}