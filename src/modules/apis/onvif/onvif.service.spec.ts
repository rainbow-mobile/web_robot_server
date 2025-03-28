import { Test, TestingModule } from '@nestjs/testing';
import { OnvifDeviceService } from './onvif.service';

describe('OnvifService', () => {
  let service: OnvifDeviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnvifDeviceService],
    }).compile();

    service = module.get<OnvifDeviceService>(OnvifDeviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
