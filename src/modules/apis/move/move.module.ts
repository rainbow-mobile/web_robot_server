import { Module } from '@nestjs/common';
import { MoveService } from './move.service';
import { MoveController } from './move.controller';
import { SocketsModule } from '@sockets/sockets.module';

@Module({
  imports: [SocketsModule],
  providers: [MoveService],
  controllers: [MoveController]
})
export class MoveModule {}
