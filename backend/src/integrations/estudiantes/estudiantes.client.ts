import { Injectable } from '@nestjs/common';

@Injectable()
export class EstudiantesClient {
  validateActiveStudent(studentId: string) {
    return {
      studentId,
      isActive: true,
      source: 'mock',
    };
  }
}
