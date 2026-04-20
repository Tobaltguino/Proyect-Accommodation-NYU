import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BuildingId, StudentGender } from '../../solicitudes/enums/solicitud.enums';

@Entity({ name: 'habitaciones' })
@Index(['buildingId', 'roomCode'], { unique: true })
export class HabitacionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: BuildingId })
  buildingId!: BuildingId;

  @Column({ type: 'enum', enum: StudentGender })
  allowedGender!: StudentGender;

  @Column({ type: 'int' })
  floor!: number;

  @Column({ type: 'varchar', length: 6 })
  roomCode!: string;

  @Column({ type: 'int', default: 2 })
  bedCapacity!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
