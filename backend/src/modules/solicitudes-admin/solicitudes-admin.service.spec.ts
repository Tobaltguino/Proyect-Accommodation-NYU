import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudesAdminService } from './solicitudes-admin.service';

describe('SolicitudesAdminService', () => {
  let service: SolicitudesAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolicitudesAdminService],
    }).compile();

    service = module.get<SolicitudesAdminService>(SolicitudesAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
