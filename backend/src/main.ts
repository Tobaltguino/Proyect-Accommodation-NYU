import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

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

  // Vercel inyectará su propio puerto en process.env.PORT
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();