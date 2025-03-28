import { Test, TestingModule } from '@nestjs/testing';
import { MotionService } from './motion.service';

describe('MotionService', () => {
  let service: MotionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MotionService],
    }).compile();

    service = module.get<MotionService>(MotionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
