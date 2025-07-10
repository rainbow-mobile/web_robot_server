import { Module } from '@nestjs/common';
import { SocketsController } from './sockets.controller';
import { SocketGateway } from './gateway/sockets.gateway';
import { VariablesModule } from '../apis/variables/variables.module';
import { LogModule } from '../apis/log/log.module';
import { SocketService } from './sockets.service';
import { MqttClientService } from './mqtt/mqtt.service';
import { KafkaClientService } from './kafka/kafka.service';
import { NetworkService } from '../apis/network/network.service';
import { SSHGateway } from './gateway/ssh.gateway';
import { InfluxDBService } from '../apis/influx/influx.service';
import { UploadService } from '../apis/upload/upload.service';
import { MoveModule } from '../apis/move/move.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoveLogEntity } from '../apis/move/entity/move.entity';

@Module({
  imports: [
    VariablesModule,
    LogModule,
    TypeOrmModule.forFeature([MoveLogEntity]),
  ],
  controllers: [SocketsController],
  providers: [
    SocketGateway,
    UploadService,
    InfluxDBService,
    SSHGateway,
    SocketService,
    MqttClientService,
    NetworkService,
    KafkaClientService,
  ],
  exports: [SocketGateway],
})
export class SocketsModule {}
