import { Test, TestingModule } from '@nestjs/testing';
import { SSHService } from './ssh.service';

describe('SSHService', () => {
  let service: SSHService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SSHService],
    }).compile();

    service = module.get<SSHService>(SSHService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
