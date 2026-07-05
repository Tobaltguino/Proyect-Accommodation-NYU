import { Injectable } from '@nestjs/common';

@Injectable()
export class PagosClient {
  validatePayment(studentId: string) {
    return {
      studentId,
      isPaymentValid: true,
      source: 'mock',
    };
  }
}
