import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Arreglo 1: Le avisamos a TypeORM el esquema 'nyu_v2' además del nombre de la tabla
@Entity({ name: 'asignacion_estancia' })
export class AsignacionEstanciaEntity {
  @PrimaryGeneratedColumn({ name: 'id_asignacion' })
  idAsignacion!: number;

  @Column({ name: 'fecha_asignacion', type: 'date' })
  fechaAsignacion!: string;

  @Column({ name: 'fecha_check_in', type: 'date', nullable: true })
  fechaCheckIn!: string | null;

  @Column({ name: 'fecha_check_out', type: 'date', nullable: true })
  fechaCheckOut!: string | null;

  // Los estados reales en tu BD son 'Activa', 'Finalizada', 'Renunciada' (con mayúscula inicial)
  @Column({ name: 'estado', type: 'varchar', length: 20 })
  estado!: string;

  @Column({ name: 'id_habitacion', type: 'int' })
  idHabitacion!: number;

  @Column({ name: 'id_periodo', type: 'int' })
  idPeriodo!: number;

  // Arreglo 2: Cambiamos 'id_usuario' por 'rut_estudiante' que es el nombre real en tu BD
  @Column({ name: 'rut_estudiante', type: 'varchar', length: 10 })
  rutEstudiante!: string;

  // Arreglo 3: Agregamos la columna que faltaba (rut_admin) y que acepta null
  @Column({ name: 'rut_admin', type: 'varchar', length: 10, nullable: true })
  rutAdmin!: string | null;
}