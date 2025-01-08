import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StateLogEntity } from './entity/state.entity';
import { PowerLogEntity } from './entity/power.entity';
import { StatusLogEntity } from './entity/status.entity';
import { SocketsModule } from '@sockets/sockets.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      StateLogEntity,
      PowerLogEntity,
      StatusLogEntity
    ])
  ],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService]
})
export class LogModule {}
