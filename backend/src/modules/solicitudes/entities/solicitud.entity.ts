import {
  Column,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity({ name: 'solicitudes' })
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

  @Column({ name: 'rut_admin', type: 'varchar' })
  rutAdmin!: string;

  @Column({ name: 'plan_alimenticio', type: 'varchar' })
  planAlimenticio!: string;

  // Temporal para evitar errores de compilación con código de compañeros
  idUsuario?: number;
}