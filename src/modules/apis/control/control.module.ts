import { Module } from '@nestjs/common';
import { ControlService } from './control.service';
import { ControlController } from './control.controller';
import { SocketsModule } from '@sockets/sockets.module';

@Module({
  imports: [SocketsModule],
  providers: [ControlService],
  controllers: [ControlController]
})
export class ControlModule {}
