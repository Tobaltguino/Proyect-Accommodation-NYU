import { Role } from '../enums/role.enum';

export interface AuthUserRecord {
  id: number;
  rut: string;
  password: string;
  fullName: string;
  role: Role;
}

export interface AuthenticatedUser {
  id: number;
  rut: string;
  fullName: string;
  role: Role;
}

export interface JwtPayload {
  sub: number;
  rut: string;
  fullName: string;
  role: Role;
}
