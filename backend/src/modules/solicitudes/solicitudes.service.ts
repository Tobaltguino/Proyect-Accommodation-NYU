import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload } from '../auth/types/auth.types';
import { PeriodosService } from '../periodos/periodos.service'; 
import { CreateSolicitudDto } from './dto';
import { SolicitudEntity } from './entities';


@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(SolicitudEntity)
    private readonly solicitudRepository: Repository<SolicitudEntity>,
    

    private readonly periodosService: PeriodosService,
  ) {}

  getStatus() {
    return { module: 'solicitudes', status: 'ok' };
  }

  async createSolicitud(user: JwtPayload, body: CreateSolicitudDto) {
    try {

      const periodoActual = await this.periodosService.obtenerActual();
      if (!periodoActual) {
        throw new BadRequestException('No hay un periodo académico activo.');
      }

      const rutEstudianteStr = user.rut;


      const existing = await this.solicitudRepository.findOne({
        where: {
          rutEstudiante: rutEstudianteStr,
          idPeriodo: periodoActual.idPeriodo,
        },
      });

      if (existing) {
        throw new ConflictException('Ya existe una postulación para este semestre');
      }


      const solicitud = await this.solicitudRepository.save(
        this.solicitudRepository.create({
          estado: 'En Revision',                                  
          fechaSolicitud: new Date().toISOString().split('T')[0],   
          idPeriodo: periodoActual.idPeriodo,                      
          idAsignacion: null,                                       
          rutEstudiante: rutEstudianteStr,                          
          rutAdmin: null,                                           
          planAlimenticio: body.planAlimenticio,                    
        }),
      );

  
      return {
        id_solicitud: solicitud.idSolicitud,
        estado: solicitud.estado,
        fecha_solicitud: solicitud.fechaSolicitud,
        id_periodo: solicitud.idPeriodo,
        rut_estudiante: solicitud.rutEstudiante,
        plan_alimenticio: solicitud.planAlimenticio,
      };

    } catch (error) {
  if (error instanceof ConflictException) throw error;
  

  const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
  
  throw new BadRequestException('Error al procesar la solicitud: ' + mensajeError);
}
  }

  async getMySolicitud(user: JwtPayload) {

    const periodoActual = await this.periodosService.obtenerActual();
    if (!periodoActual) return null;


    return await this.solicitudRepository.findOne({
      where: {
        rutEstudiante: user.rut,
        idPeriodo: periodoActual.idPeriodo,
      },
    });
  }
}