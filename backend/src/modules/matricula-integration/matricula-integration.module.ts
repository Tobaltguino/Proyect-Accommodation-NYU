// /home/renato/Documentos/Proyect-Accommodation-NYU/backend/src/modules/matricula-integration/matricula-integration.module.ts
import { Module } from '@nestjs/common';
import { MatriculaIntegrationService } from './matricula-integration.service';
import { MatriculaIntegrationController } from './matricula-integration.controller';
import { AuthModule } from '../auth/auth.module'; // <--- IMPORTA AQUÍ EL MÓDULO QUE TIENE EL JWT

@Module({
  imports: [
    AuthModule, 
  ],
  controllers: [MatriculaIntegrationController],
  providers: [MatriculaIntegrationService],
  exports: [MatriculaIntegrationService],
})
export class MatriculaIntegrationModule {}