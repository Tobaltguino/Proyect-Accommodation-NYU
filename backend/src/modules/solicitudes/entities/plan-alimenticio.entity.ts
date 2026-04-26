import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'plan_alimenticio', schema: 'relacional_v1' })
export class PlanAlimenticioEntity {
  @PrimaryGeneratedColumn({ name: 'id_plan' })
  idPlan!: number;

  @Column({ name: 'tipo_plan', type: 'varchar', length: 30 })
  tipoPlan!: string;

  @Column({ name: 'id_periodo', type: 'int' })
  idPeriodo!: number;

  @Column({ name: 'id_usuario', type: 'int' })
  idUsuario!: number;
}
