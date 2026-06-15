import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudesAdminController } from './solicitudes-admin.controller';
import { SolicitudesAdminService } from './solicitudes-admin.service';

describe('SolicitudesAdminController', () => {
  let controller: SolicitudesAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitudesAdminController],
      providers: [SolicitudesAdminService],
    }).compile();

    controller = module.get<SolicitudesAdminController>(
      SolicitudesAdminController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
