import { Test, TestingModule } from '@nestjs/testing';
import { ProcessController } from './process.controller';
import { ProcessService } from './process.service';

describe('ProcessController', () => {
  let controller: ProcessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessController],
      providers: [ProcessService],
    }).compile();

    controller = module.get<ProcessController>(ProcessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
