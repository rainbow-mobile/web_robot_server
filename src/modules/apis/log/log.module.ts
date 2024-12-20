import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StateLogEntity } from './entity/state.entity';
import { PowerLogEntity } from './entity/power.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      StateLogEntity,
      PowerLogEntity
    ])
  ],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService]
})
export class LogModule {}
