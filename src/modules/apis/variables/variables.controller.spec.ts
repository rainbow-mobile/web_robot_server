import { Test, TestingModule } from '@nestjs/testing';
import { VariablesController } from './variables.controller';
import { VariablesService } from './variables.service';

describe('VariablesController', () => {
  let controller: VariablesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VariablesController],
      providers: [VariablesService],
    }).compile();

    controller = module.get<VariablesController>(VariablesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
