import { Test, TestingModule } from '@nestjs/testing';
import { EdificiosController } from './edificios.controller';
import { EdificiosService } from './edificios.service';

describe('EdificiosController', () => {
  let controller: EdificiosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EdificiosController],
      providers: [EdificiosService],
    }).compile();

    controller = module.get<EdificiosController>(EdificiosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
