import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AsignacionEntity } from 'src/modules/asignaciones/entities/asignacion.entity';
import { HabitacionEntity } from 'src/modules/residencias/entities';

@Entity({ name: 'historial_residencia', schema: 'public' })
export class HistorialResidenciaEntity {
  @PrimaryGeneratedColumn({ name: 'id_historial', type: 'bigint' })
  idHistorial!: string;

  @Column({ name: 'tipo_movimiento', type: 'varchar', length: 30 })
  tipoMovimiento!: string;

  @Column({ name: 'fecha_movimiento', type: 'timestamptz' })
  fechaMovimiento!: Date;

  @Column({ name: 'rut_estudiante', type: 'varchar', length: 20 })
  rutEstudiante!: string;

  @Column({ name: 'rut_admin', type: 'varchar', length: 20, nullable: true })
  rutAdmin!: string | null;

  @Column({ name: 'id_asignacion', type: 'int' })
  idAsignacion!: number;

  @Column({ name: 'id_habitacion_anterior', type: 'int', nullable: true })
  idHabitacionAnterior!: number | null;

  @Column({ name: 'id_habitacion_nueva', type: 'int', nullable: true })
  idHabitacionNueva!: number | null;

  @Column({
    name: 'estado_anterior',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  estadoAnterior!: string | null;

  @Column({ name: 'estado_nuevo', type: 'varchar', length: 20, nullable: true })
  estadoNuevo!: string | null;

  @Column({ name: 'observacion', type: 'varchar', length: 500, nullable: true })
  observacion!: string | null;

  @ManyToOne(() => AsignacionEntity)
  @JoinColumn({ name: 'id_asignacion' })
  asignacion!: AsignacionEntity;

  @ManyToOne(() => HabitacionEntity, { nullable: true })
  @JoinColumn({ name: 'id_habitacion_anterior' })
  habitacionAnterior!: HabitacionEntity | null;

  @ManyToOne(() => HabitacionEntity, { nullable: true })
  @JoinColumn({ name: 'id_habitacion_nueva' })
  habitacionNueva!: HabitacionEntity | null;
}
