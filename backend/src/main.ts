import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // <-- 1. Importaciones

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 Configuración explícita de CORS para Vercel
  app.enableCors({
    origin: '*', // Permite peticiones desde cualquier URL (como tu frontend)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Tus validaciones (se mantienen intactas, están perfectas)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ==================================================
  // 2. CONFIGURACIÓN DE SWAGGER
  // ==================================================
  const config = new DocumentBuilder()
    .setTitle('API de Sistema de Residencias')
    .setDescription('Documentación de los endpoints para el equipo de Frontend y Finanzas')
    .setVersion('1.0')
    .addBearerAuth() // <-- Clave para que Swagger te deje poner el token JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // La URL será: http://localhost:3000/api/docs
  // ==================================================

  // Vercel inyectará su propio puerto en process.env.PORT
  await app.listen(process.env.PORT ?? 3000);

}
void bootstrap();