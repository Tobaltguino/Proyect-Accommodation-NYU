import { Test, TestingModule } from '@nestjs/testing';
import { PisosController } from './pisos.controller';
import { PisosService } from './pisos.service';

describe('PisosController', () => {
  let controller: PisosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PisosController],
      providers: [PisosService],
    }).compile();

    controller = module.get<PisosController>(PisosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
