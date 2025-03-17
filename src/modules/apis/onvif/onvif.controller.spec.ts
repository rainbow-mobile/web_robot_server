import { Test, TestingModule } from '@nestjs/testing';
import { OnvifController } from './onvif.controller';

describe('OnvifController', () => {
  let controller: OnvifController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnvifController],
    }).compile();

    controller = module.get<OnvifController>(OnvifController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
