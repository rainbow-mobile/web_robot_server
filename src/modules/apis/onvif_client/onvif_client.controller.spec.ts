import { Test, TestingModule } from '@nestjs/testing';
import { OnvifClientController } from './onvif_client.controller';

describe('OnvifClientController', () => {
  let controller: OnvifClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnvifClientController],
    }).compile();

    controller = module.get<OnvifClientController>(OnvifClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
