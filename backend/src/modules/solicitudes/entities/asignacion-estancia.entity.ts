import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'asignacion_estancia', schema: 'public' })
export class AsignacionEstanciaEntity {
  @PrimaryGeneratedColumn({ name: 'id_asignacion' })
  idAsignacion!: number;

  @Column({ name: 'fecha_asignacion', type: 'date' })
  fechaAsignacion!: string;

  @Column({ name: 'fecha_check_in', type: 'date', nullable: true })
  fechaCheckIn!: string | null;

  @Column({ name: 'fecha_check_out', type: 'date', nullable: true })
  fechaCheckOut!: string | null;

  @Column({ name: 'estado', type: 'varchar', length: 20 })
  estado!: string;

  @Column({ name: 'id_habitacion', type: 'int' })
  idHabitacion!: number;

  @Column({ name: 'id_periodo', type: 'int' })
  idPeriodo!: number;

  @Column({ name: 'rut_estudiante', type: 'varchar' })
  rutEstudiante!: string;

  @Column({ name: 'rut_admin', type: 'varchar', nullable: true })
  rutAdmin!: string | null;
}
