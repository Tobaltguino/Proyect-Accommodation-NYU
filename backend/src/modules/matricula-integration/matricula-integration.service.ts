import { Injectable } from '@nestjs/common';

@Injectable()
export class MatriculaIntegrationService {
  private readonly BASE_URL = 'https://matricula-nyu-backend.onrender.com';

  async verificarMatricula(rut: string): Promise<boolean> {
    const PRIVATE_KEY = process.env.INTEGRATION_API_KEY;

    try {
      const tokenResponse = await fetch(`${this.BASE_URL}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privateKey: PRIVATE_KEY })
      });

      if (!tokenResponse.ok) return false;

      const { token } = await tokenResponse.json();

      const estadoResponse = await fetch(`${this.BASE_URL}/matricula/estado`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rut })
      });

      if (estadoResponse.status === 404) return false;
      if (!estadoResponse.ok) return false;

      const data = await estadoResponse.json();
      return !!data.esActivo;
    } catch {
      return false;
    }
  }
}