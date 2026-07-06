import { Injectable, InternalServerErrorException, NotFoundException, BadGatewayException } from '@nestjs/common';

@Injectable()
export class MatriculaIntegrationService {
  private readonly BASE_URL = 'https://matricula-nyu-backend.onrender.com';

  async verificarMatricula(rut: string): Promise<boolean> {
    const PRIVATE_KEY = process.env.NYU_INTEGRATION_MATRICULA_API_KEY;

    const tokenResponse = await fetch(`${this.BASE_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ privateKey: PRIVATE_KEY })
    });

    if (!tokenResponse.ok) {
      throw new BadGatewayException('Error de conexión con el servidor de autenticación de NYU');
    }

    const { token } = await tokenResponse.json();

    const rutNormalizado = rut.replace(/\./g, '');
    const estadoResponse = await fetch(`${this.BASE_URL}/matricula/estado`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rut: rutNormalizado })
    });

    if (estadoResponse.status === 404) {
      throw new NotFoundException(`Matrícula no encontrada para el RUT: ${rut}`);
    }

    if (!estadoResponse.ok) {
      throw new InternalServerErrorException('Error al consultar el estado de matrícula en NYU');
    }

    const data = await estadoResponse.json();
    return !!data.activa;
  }
}