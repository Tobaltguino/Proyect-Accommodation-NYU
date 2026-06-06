import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import { EdificioEntity } from './edificio.entity';

@Entity({ name: 'piso' })
export class PisoEntity {
  @PrimaryGeneratedColumn({ name: 'id_piso' })
  idPiso!: number;

  @Column({ name: 'nro_piso', type: 'int' })
  nroPiso!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 20 })
  nombre!: string;

  @Column({ name: 'id_edificio', type: 'int' })
  idEdificio!: number;

  @ManyToOne(() => EdificioEntity)
  @JoinColumn({ name: 'id_edificio' })
  edificio!: EdificioEntity;

}
