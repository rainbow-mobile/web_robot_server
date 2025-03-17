import { Test, TestingModule } from '@nestjs/testing';
import { OnvifClientService } from './onvif_client.service';

describe('OnvifClientService', () => {
  let service: OnvifClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnvifClientService],
    }).compile();

    service = module.get<OnvifClientService>(OnvifClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
