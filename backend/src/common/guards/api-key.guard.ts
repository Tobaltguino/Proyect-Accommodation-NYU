import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Buscamos el token en los headers 
    const authHeader = request.headers['authorization'];

    // Verificamos que sea igual a nuestra llave del .env
    if (authHeader && authHeader === `Bearer ${process.env.INTEGRATION_API_KEY}`) {
      return true; // Pasa el guardia
    }

    // Si no trae el token o es incorrecto, lo rechazamos
    throw new UnauthorizedException('Token de servicio inválido o ausente. Acceso denegado.');
  }
}