import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { PisoEntity } from './piso.entity';

@Entity({ name: 'habitacion' })
export class HabitacionEntity {
  @PrimaryGeneratedColumn({ name: 'id_habitacion' })
  idHabitacion!: number;

  @Column({ name: 'disponibilidad', type: 'boolean' })
  disponibilidad!: boolean;

  @Column({ name: 'capacidad_actual', type: 'int' })
  capacidadActual!: number;

  @Column({ name: 'nro_habitacion', type: 'int' })
  nroHabitacion!: number;

  @Column({ name: 'id_piso', type: 'int' })
  idPiso!: number;

  @Column({ name: 'capacidad_total', type: 'int' })
  capacidadTotal!: number;

  @ManyToOne(() => PisoEntity, (piso) => piso.habitaciones)
  @JoinColumn({ name: 'id_piso' })
  piso!: PisoEntity;

}
