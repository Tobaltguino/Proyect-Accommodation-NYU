import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PisosService } from './pisos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('pisos')
export class PisosController {
  constructor(private readonly pisosService: PisosService) {}

  // GET http://localhost:3000/pisos
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  obtenerTodos() {
    return this.pisosService.obtenerTodos();
  }

  // POST http://localhost:3000/pisos
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  crearPiso(
    @Body('nroPiso') nroPiso: number,
    @Body('nombre') nombre: string,
    @Body('idEdificio') idEdificio: number,
  ) {
    return this.pisosService.crearPiso(nroPiso, nombre, idEdificio);
  }

  // GET http://localhost:3000/pisos/edificio/1
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('edificio/:idEdificio')
  obtenerPorEdificio(@Param('idEdificio', ParseIntPipe) idEdificio: number) {
    return this.pisosService.obtenerPorEdificio(idEdificio);
  }

  // PATCH http://localhost:3000/pisos/5
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  modificarPiso(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosActualizados: any,
  ) {
    return this.pisosService.modificarPiso(id, datosActualizados);
  }

  // DELETE http://localhost:3000/pisos/5
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  eliminarPiso(@Param('id', ParseIntPipe) idPiso: number) {
    return this.pisosService.eliminarPiso(idPiso);
  }
}
