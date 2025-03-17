import { Test, TestingModule } from '@nestjs/testing';
import { OnvifService } from './onvif.service';

describe('OnvifService', () => {
  let service: OnvifService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnvifService],
    }).compile();

    service = module.get<OnvifService>(OnvifService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
