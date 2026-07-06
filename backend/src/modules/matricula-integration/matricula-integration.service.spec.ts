import { Test, TestingModule } from '@nestjs/testing';
import { MatriculaIntegrationService } from './matricula-integration.service';

describe('MatriculaIntegrationService', () => {
  let service: MatriculaIntegrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatriculaIntegrationService],
    }).compile();

    service = module.get<MatriculaIntegrationService>(MatriculaIntegrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
