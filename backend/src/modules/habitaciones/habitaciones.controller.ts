import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Get,
  UseGuards,
} from '@nestjs/common';
import { HabitacionesService } from './habitaciones.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
// Si tienes un DTO, lo ideal es usarlo en el @Body() del Patch,
// pero usaremos 'any' o un objeto para mantenerlo funcional rápidamente.

@Controller('habitaciones')
export class HabitacionesController {
  constructor(private readonly habitacionesService: HabitacionesService) {}

  // POST http://localhost:3000/habitaciones
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  crearHabitacion(
    @Body('nroHabitacion') nroHabitacion: number,
    @Body('capacidadActual') capacidadActual: number,
    @Body('disponibilidad') disponibilidad: boolean,
    @Body('idPiso') idPiso: number,
  ) {
    return this.habitacionesService.crearHabitacion(
      nroHabitacion,
      capacidadActual,
      disponibilidad,
      idPiso,
    );
  }

  // GET http://localhost:3000/habitaciones
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  obtenerTodas() {
    return this.habitacionesService.obtenerTodas();
  }

  //TEMPORAL QUIZAS
  // GET http://localhost:3000/habitaciones/detalles
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('detalles')
  obtenerTodasConPiso() {
    return this.habitacionesService.obtenerTodasConPiso();
  }

  // GET http://localhost:3000/habitaciones/disponibles/total
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('disponibles/total')
  obtenerTotalDisponibles() {
    return this.habitacionesService.obtenerTotalDisponibles();
  }

  // GET http://localhost:3000/habitaciones/edificio/1
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('edificio/:idEdificio')
  obtenerPorEdificio(@Param('idEdificio', ParseIntPipe) idEdificio: number) {
    return this.habitacionesService.obtenerPorEdificio(idEdificio);
  }

  // PATCH http://localhost:3000/habitaciones/5
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  modificarHabitacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosActualizados: any, // Recibe cualquier campo de HabitacionEntity
  ) {
    return this.habitacionesService.modificarHabitacion(id, datosActualizados);
  }

  // DELETE http://localhost:3000/habitaciones/5
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  eliminarHabitacion(@Param('id', ParseIntPipe) id: number) {
    return this.habitacionesService.eliminarHabitacion(id);
  }
}
