import { Test, TestingModule } from '@nestjs/testing';
import { MotionController } from './motion.controller';
import { MotionService } from './motion.service';

describe('MotionController', () => {
  let controller: MotionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MotionController],
      providers: [MotionService],
    }).compile();

    controller = module.get<MotionController>(MotionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
