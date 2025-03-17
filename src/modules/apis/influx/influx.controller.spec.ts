import { Test, TestingModule } from '@nestjs/testing';
import { INFLUXController } from './influx.controller';
import { InfluxDBService } from './influx.service';

describe('ProcessController', () => {
  let controller: INFLUXController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [INFLUXController],
      providers: [InfluxDBService],
    }).compile();

    controller = module.get<INFLUXController>(INFLUXController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
