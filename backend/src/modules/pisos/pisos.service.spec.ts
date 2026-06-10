import { Test, TestingModule } from '@nestjs/testing';
import { PisosService } from './pisos.service';

describe('PisosService', () => {
  let service: PisosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PisosService],
    }).compile();

    service = module.get<PisosService>(PisosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
