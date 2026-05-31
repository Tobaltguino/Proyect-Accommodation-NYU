export type Role = 'ADMIN' | 'STUDENT';

export interface SessionUser {
  id: number;
  rut: string;
  fullName: string;
  role: Role;
  genero?: string;
}

export interface LoginRequest {
  rut: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: SessionUser;
}
