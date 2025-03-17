import { Test, TestingModule } from '@nestjs/testing';
import { INFLUXController } from './influx.controller';
import { InfluxDBService } from './influx.service';

describe('InfluxDBService', () => {
  let service: InfluxDBService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InfluxDBService],
    }).compile();

    service = module.get<InfluxDBService>(InfluxDBService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
