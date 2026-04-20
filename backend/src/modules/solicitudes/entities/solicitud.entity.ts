import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  BuildingId,
  MealPlan,
  SolicitudStatus,
  StudentGender,
} from '../enums/solicitud.enums';

@Entity({ name: 'solicitudes' })
@Index(['rut', 'semester'], { unique: true })
export class SolicitudEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 16 })
  rut!: string;

  @Column({ type: 'varchar', length: 140 })
  fullName!: string;

  @Column({ type: 'varchar', length: 16 })
  semester!: string;

  @Column({ type: 'varchar', length: 120 })
  career!: string;

  @Column({ type: 'enum', enum: StudentGender })
  gender!: StudentGender;

  @Column({ type: 'varchar', length: 30 })
  phone!: string;

  @Column({ type: 'varchar', length: 80 })
  city!: string;

  @Column({ type: 'enum', enum: MealPlan })
  mealPlan!: MealPlan;

  @Column({ type: 'enum', enum: BuildingId })
  buildingId!: BuildingId;

  @Column({ type: 'varchar', length: 6 })
  roomCode!: string;

  @Column({ type: 'text' })
  motivation!: string;

  @Column({ type: 'enum', enum: SolicitudStatus, default: SolicitudStatus.EN_REVISION })
  status!: SolicitudStatus;

  @Column({ type: 'datetime', nullable: true })
  reservationExpiresAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
