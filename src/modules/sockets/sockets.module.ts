import { Module } from '@nestjs/common';
import { SocketsController } from './sockets.controller';
import { SocketGateway } from './gateway/sockets.gateway';
import { VariablesModule } from '../apis/variables/variables.module';
import { LogModule } from '../apis/log/log.module';
import { SocketService } from './sockets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { StateLogEntity } from '../apis/log/entity/state.entity';
import { PowerLogEntity } from '../apis/log/entity/power.entity';
import { MqttClientService } from './mqtt/mqtt.service';
import { KafkaClientService } from './kafka/kafka.service';
import { NetworkModule } from '../apis/network/network.module';
import { NetworkService } from '../apis/network/network.service';

@Module({
  imports:[VariablesModule, LogModule],
  controllers: [SocketsController],
  providers: [SocketGateway,SocketService,MqttClientService,NetworkService,KafkaClientService],
  exports: [SocketGateway],
})

export class SocketsModule {}
