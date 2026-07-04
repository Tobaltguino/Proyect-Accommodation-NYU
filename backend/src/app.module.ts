import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import envConfig from './config/env.config';

import { AsignacionesModule } from './modules/asignaciones/asignaciones.module';
import { AuthModule } from './modules/auth/auth.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { HistorialModule } from './modules/historial/historial.module';
import { IncidenciasModule } from './modules/incidencias/incidencias.module';
import { PeriodosModule } from './modules/periodos/periodos.module';
import { ResidenciasModule } from './modules/residencias/residencias.module';
import { SolicitudesModule } from './modules/solicitudes/solicitudes.module';
import { PisosModule } from './modules/pisos/pisos.module';
import { HabitacionesModule } from './modules/habitaciones/habitaciones.module';
import { EdificiosModule } from './modules/edificios/edificios.module';

import { SolicitudesAdminModule } from './modules/solicitudes-admin/solicitudes-admin.module';

import { UsersModule } from './modules/users/users.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { PlanAlimenticioService } from './modules/plan-alimenticio/plan-alimenticio.service';
import { PlanAlimenticioController } from './modules/plan-alimenticio/plan-alimenticio.controller';
import { PlanAlimenticioModule } from './modules/plan-alimenticio/plan-alimenticio.module';
import { PagosModule } from './modules/pagos/pagos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [envConfig],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),

    AuthModule,
    ResidenciasModule,
    SolicitudesModule,
    UsersModule,
    AsignacionesModule,
    IncidenciasModule,
    CheckinModule,
    HistorialModule,
    SolicitudesAdminModule,
    PisosModule,
    HabitacionesModule,
    PeriodosModule,
    EdificiosModule,
    PlanAlimenticioModule,
    PagosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
