import {
  BadRequestException,
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UsuarioEntity } from '../users/entities'; // Asegúrate de que UsuarioEntity tenga la columna 'genero'
import { Role } from './enums/role.enum';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser, JwtPayload } from './types/auth.types';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
  ) { }

  async onModuleInit(): Promise<void> {
    await this.ensureSeedUsers();
  }

  async login(rut: string, password: string) {
    if (!rut || !password) {
      throw new BadRequestException('RUT y password son requeridos');
    }

    const normalizedRut = this.normalizeRut(rut);

    const users = await this.usuarioRepository.find({
      where: [{ rut }, { rut: normalizedRut }],
    });

    const user = users.find(
      (candidate) =>
        this.normalizeRut(candidate.rut) === normalizedRut &&
        candidate.contrasena === password,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const role = this.toRole(user.tipoUsuario);

    // CAMBIO 1: Agregamos el género al Payload del Token
    const payload: JwtPayload = {
      sub: user.idUsuario,
      rut: this.normalizeRut(user.rut),
      fullName: user.nombre,
      role,
      genero: user.genero, // <-- Extraemos el género de la base de datos
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: this.toAuthenticatedUser(payload),
    };
  }

  async register(body: RegisterDto) {
    const normalizedRut = this.normalizeRut(body.rut);
    const existing = await this.usuarioRepository.find({
      where: [{ rut: body.rut }, { rut: normalizedRut }],
    });

    if (existing.some((user) => this.normalizeRut(user.rut) === normalizedRut)) {
      throw new ConflictException('Ya existe un usuario registrado con ese RUT');
    }

    const newUser = await this.usuarioRepository.save(
      this.usuarioRepository.create({
        nombre: body.fullName,
        rut: normalizedRut,
        contrasena: body.password,
        tipoUsuario: this.toTipoUsuario(body.role),
        genero: (body as any).genero || 'No Especificado', // <-- Guardamos el género (Asegúrate de agregarlo al RegisterDto)
      }),
    );

    // CAMBIO 2: Agregamos el género al Payload al registrar
    const payload: JwtPayload = {
      sub: newUser.idUsuario,
      rut: this.normalizeRut(newUser.rut),
      fullName: newUser.nombre,
      role: this.toRole(newUser.tipoUsuario),
      genero: newUser.genero, // <-- Lo inyectamos aquí
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: this.toAuthenticatedUser(payload),
    };
  }

  // CAMBIO 3: Devolvemos el género en el objeto final
  toAuthenticatedUser(payload: JwtPayload): AuthenticatedUser {
    return {
      id: payload.sub,
      rut: payload.rut,
      fullName: payload.fullName,
      role: payload.role,
      genero: payload.genero, // <-- Exportado para el frontend y los Guards
    };
  }

  private normalizeRut(rut: string): string {
    return rut.replace(/\./g, '').toUpperCase();
  }

  private toRole(tipoUsuario: string): Role {
    return tipoUsuario === 'Admin' ? Role.ADMIN : Role.STUDENT;
  }

  private toTipoUsuario(role: Role): 'Admin' | 'Estudiante' {
    return role === Role.ADMIN ? 'Admin' : 'Estudiante';
  }

  // CAMBIO 4: Añadimos género a los usuarios de prueba (Seeders)
  private async ensureSeedUsers(): Promise<void> {
    const total = await this.usuarioRepository.count();

    if (total > 0) {
      return;
    }

    await this.usuarioRepository.save([
      this.usuarioRepository.create({
        nombre: 'Administrador NYU',
        rut: '12345678-5',
        contrasena: 'Admin123*',
        tipoUsuario: 'Admin',
        genero: 'Masculino', // Admin
      }),
      this.usuarioRepository.create({
        nombre: 'Juanito Carlos Perez Hernandez',
        rut: '87654321-K',
        contrasena: 'Student123*',
        tipoUsuario: 'Estudiante',
        genero: 'Masculino', // Estudiante Hombre
      }),
      this.usuarioRepository.create({
        nombre: 'Maria Fernanda Soto Rojas',
        rut: '11222333-4',
        contrasena: 'Student456*',
        tipoUsuario: 'Estudiante',
        genero: 'Femenino', // Estudiante Mujer
      }),
      this.usuarioRepository.create({
        nombre: 'Diego Alejandro Vargas Morales',
        rut: '20567891-7',
        contrasena: 'Student789*',
        tipoUsuario: 'Estudiante',
        genero: 'Masculino',
      }),
    ]);
  }
}