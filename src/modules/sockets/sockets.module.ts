import { Module } from '@nestjs/common';
import { SocketsController } from './sockets.controller';
import { SocketGateway } from './gateway/sockets.gateway';
import { VariablesModule } from '../apis/variables/variables.module';

@Module({
  imports:[VariablesModule],
  controllers: [SocketsController],
  providers: [SocketGateway],
  exports: [SocketGateway],
})

export class SocketsModule {}
