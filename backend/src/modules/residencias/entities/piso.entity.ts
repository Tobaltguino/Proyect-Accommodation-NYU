import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { EdificioEntity } from './edificio.entity';
import { HabitacionEntity } from './habitacion.entity';

@Entity({ name: 'piso', schema: 'public' })
export class PisoEntity {
  @PrimaryGeneratedColumn({ name: 'id_piso' })
  idPiso!: number;

  @Column({ name: 'nro_piso', type: 'int' })
  nroPiso!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 20 })
  nombre!: string;

  @Column({ name: 'id_edificio', type: 'int' })
  idEdificio!: number;

  @ManyToOne(() => EdificioEntity, (edificio) => edificio.pisos)
  @JoinColumn({ name: 'id_edificio' })
  edificio!: EdificioEntity;

  @OneToMany(() => HabitacionEntity, (habitacion) => habitacion.piso)
  habitaciones!: HabitacionEntity[];
}
