import { Test, TestingModule } from '@nestjs/testing';
import { OnvifDeviceController } from './onvif.controller';

describe('OnvifDeviceController', () => {
  let controller: OnvifDeviceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnvifDeviceController],
    }).compile();

    controller = module.get<OnvifDeviceController>(OnvifDeviceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
