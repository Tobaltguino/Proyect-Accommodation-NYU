import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { UsuarioEntity } from '../../users/entities/usuario.entity';


@Entity({ name: 'solicitudes', schema: 'public' })
export class SolicitudEntity {
  @PrimaryGeneratedColumn({ name: 'id_solicitud' })
  idSolicitud!: number;

  @Column({ name: 'estado', type: 'varchar', length: 20 })
  estado!: string;

  @Column({ name: 'fecha_solicitud', type: 'date' })
  fechaSolicitud!: string;

  @Column({ name: 'id_periodo', type: 'int' })
  idPeriodo!: number;

  @Column({ name: 'id_asignacion', type: 'int', nullable: true })
  idAsignacion!: number | null;

  @Column({ name: 'rut_estudiante', type: 'varchar' })
  rutEstudiante!: string;

  @Column({ name: 'rut_admin', type: 'varchar', nullable: true })
  rutAdmin!: string | null;

  @Column({ name: 'plan_alimenticio', type: 'varchar' })
  planAlimenticio!: string;
}
