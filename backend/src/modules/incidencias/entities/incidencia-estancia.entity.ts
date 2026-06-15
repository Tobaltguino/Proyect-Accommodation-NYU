import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'incidencia_estancia', schema: 'public' })
export class IncidenciaEstanciaEntity {
  @PrimaryGeneratedColumn({ name: 'id_incidencia' })
  idIncidencia!: number;

  @Column({ name: 'descripcion', type: 'varchar', length: 500 })
  descripcion!: string;

  @Column({ name: 'fecha', type: 'date' })
  fecha!: string;

  @Column({ name: 'gravedad', type: 'varchar', length: 20 })
  gravedad!: string;

  @Column({ name: 'id_habitacion', type: 'int' })
  idHabitacion!: number;

  @Column({ name: 'rut_estudiante', type: 'varchar' })
  rutEstudiante!: string;

  @Column({ name: 'rut_admin', type: 'varchar', nullable: true })
  rutAdmin!: string | null;
}
