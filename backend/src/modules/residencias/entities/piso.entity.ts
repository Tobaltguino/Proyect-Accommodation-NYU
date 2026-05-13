import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
