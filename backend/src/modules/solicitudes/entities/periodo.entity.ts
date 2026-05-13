import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'periodo', schema: 'public' })
export class PeriodoEntity {
  @PrimaryGeneratedColumn({ name: 'id_periodo' })
  idPeriodo!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 50 })
  nombre!: string;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: string;

  @Column({ name: 'fecha_termino', type: 'date' })
  fechaTermino!: string;
}
