import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'edificio', schema: 'relacional_v1' })
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
}
