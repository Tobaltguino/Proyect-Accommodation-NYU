import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
}
