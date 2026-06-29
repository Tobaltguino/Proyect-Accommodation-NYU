import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const dbHost =
    configService.get<string>('DB_HOST') ??
    configService.get<string>('database.host');
  const dbPort =
    configService.get<number>('DB_PORT') ??
    configService.get<number>('database.port') ??
    5432;
  const dbUser =
    configService.get<string>('DB_USER') ??
    configService.get<string>('database.username');
  const dbPassword =
    configService.get<string>('DB_PASSWORD') ??
    configService.get<string>('database.password');
  const dbName =
    configService.get<string>('DB_NAME') ??
    configService.get<string>('database.name');
  const useSsl =
    (configService.get<string>('DB_SSL') ?? 'true') === 'true' ||
    (configService.get<boolean>('database.ssl') ?? false);

  return {
    type: 'postgres',
    host: dbHost,
    port: dbPort,
    username: dbUser,
    password: dbPassword,
    database: dbName,
    autoLoadEntities: true,
    synchronize: false,
    migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
    ssl: useSsl
      ? {
          rejectUnauthorized: false,
        }
      : false,
  };
};
