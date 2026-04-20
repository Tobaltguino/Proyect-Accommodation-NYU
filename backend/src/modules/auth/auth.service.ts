import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HARDCODED_USERS } from './constants/hardcoded-users';
import { AuthenticatedUser, JwtPayload } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(rut: string, password: string) {
    if (!rut || !password) {
      throw new BadRequestException('RUT y password son requeridos');
    }

    const normalizedRut = this.normalizeRut(rut);

    const user = HARDCODED_USERS.find(
      (candidate) =>
        candidate.rut === normalizedRut &&
        candidate.password === password,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      rut: user.rut,
      fullName: user.fullName,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: this.toAuthenticatedUser(payload),
    };
  }

  toAuthenticatedUser(payload: JwtPayload): AuthenticatedUser {
    return {
      id: payload.sub,
      rut: payload.rut,
      fullName: payload.fullName,
      role: payload.role,
    };
  }

  private normalizeRut(rut: string): string {
    return rut.replace(/\./g, '').toUpperCase();
  }
}
