import { Test, TestingModule } from '@nestjs/testing';
import { SoundService } from './sound.service';

describe('SoundService', () => {
  let service: SoundService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SoundService],
    }).compile();

    service = module.get<SoundService>(SoundService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
