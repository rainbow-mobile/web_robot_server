import { Test, TestingModule } from '@nestjs/testing';
import { SSHController } from './ssh.controller';

describe('SSHController', () => {
  let controller: SSHController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SSHController],
    }).compile();

    controller = module.get<SSHController>(SSHController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
