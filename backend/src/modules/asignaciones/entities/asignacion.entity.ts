import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import { PeriodoEntity } from 'src/modules/solicitudes/entities';
import { HabitacionEntity } from 'src/modules/residencias/entities';

@Entity({ name: 'asignacion_estancia' })
export class AsignacionEntity {
    @PrimaryGeneratedColumn({ name: 'id_asignacion' })
    idAsignacion!: number;

    @Column({ name: 'fecha_asignacion', type: 'date' })
    fechaAsignacion!: Date;

    @Column({ name: 'fecha_check_in', type: 'date', nullable: true })
    fechaCheckIn!: Date | null;

    @Column({ name: 'fecha_check_out', type: 'date', nullable: true })
    fechaCheckOut!: Date | null;

    @Column({ name: 'estado', type: 'varchar', length: 20 })
    estado!: string;

    @Column({ name: 'id_habitacion', type: 'int' })
    idHabitacion!: number;

    @Column({ name: 'id_periodo', type: 'int' })
    idPeriodo!: number;

    @Column({ name: 'rut_estudiante', type: 'varchar', length: 20 })
    rutEstudiante!: string;

    @Column({ name: 'rut_admin', type: 'varchar', length: 20 })
    rutAdmin!: string;

    @ManyToOne(() => PeriodoEntity)
    @JoinColumn({ name: 'id_periodo' })
    periodo!: PeriodoEntity;

    @ManyToOne(() => HabitacionEntity)
    @JoinColumn({ name: 'id_habitacion' })
    habitacion!: HabitacionEntity;


}
