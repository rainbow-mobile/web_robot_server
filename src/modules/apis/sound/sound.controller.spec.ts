import { Test, TestingModule } from '@nestjs/testing';
import { SoundController } from './sound.controller';
import { SoundService } from './sound.service';

describe('SoundController', () => {
  let controller: SoundController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SoundController],
      providers: [SoundService],
    }).compile();

    controller = module.get<SoundController>(SoundController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
