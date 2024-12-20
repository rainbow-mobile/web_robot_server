import { Module } from '@nestjs/common';
import { ProcessService } from './process.service';
import { ProcessController } from './process.controller';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { SocketsModule } from '@sockets/sockets.module';

@Module({
  imports: [SocketsModule],
  controllers: [ProcessController],
  providers: [ProcessService],
})
export class ProcessModule {}
