import { Module } from '@nestjs/common';
import { InfluxDBService } from './influx.service';
import { INFLUXController } from './influx.controller';

@Module({
  providers: [InfluxDBService],
  controllers: [INFLUXController],
  exports: [InfluxDBService],
})
export class InfluxDBModule {}
