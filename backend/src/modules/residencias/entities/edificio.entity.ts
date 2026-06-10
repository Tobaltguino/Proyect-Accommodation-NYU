import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PisoEntity } from './piso.entity';

@Entity({ name: 'edificio', schema: 'public' })
export class EdificioEntity {
  @PrimaryGeneratedColumn({ name: 'id_edificio' })
  idEdificio!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 50 })
  nombre!: string;

  @Column({ name: 'ubicacion', type: 'varchar', length: 100 })
  ubicacion!: string;

  @Column({ name: 'capacidad_habitaciones', type: 'int' })
  capacidadHabitaciones!: number;

  @Column({ name: 'genero', type: 'varchar', length: 10 })
  genero!: string;

  @OneToMany(() => PisoEntity, (piso) => piso.edificio)
  pisos!: PisoEntity[];

}
