import { AuthUserRecord } from '../types/auth.types';
import { Role } from '../enums/role.enum';

export const HARDCODED_USERS: AuthUserRecord[] = [
  {
    id: 1,
    rut: '12345678-5',
    password: 'Admin123*',
    fullName: 'Administrador NYU',
    role: Role.ADMIN,
  },
  {
    id: 2,
    rut: '87654321-K',
    password: 'Student123*',
    fullName: 'Juanito Carlos Perez Hernandez',
    role: Role.STUDENT,
  },
  {
    id: 3,
    rut: '11222333-4',
    password: 'Student456*',
    fullName: 'Maria Fernanda Soto Rojas',
    role: Role.STUDENT,
  },
];
