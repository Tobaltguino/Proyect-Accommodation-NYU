import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'usuario', schema: 'public' })
export class UsuarioEntity {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  idUsuario!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 50 })
  nombre!: string;

  @Column({ name: 'rut', type: 'varchar', length: 20, unique: true })
  rut!: string;

  @Column({ name: 'contrasena', type: 'varchar', length: 100 })
  contrasena!: string;

  @Column({ name: 'tipo_usuario', type: 'varchar', length: 15 })
  tipoUsuario!: string;
}
