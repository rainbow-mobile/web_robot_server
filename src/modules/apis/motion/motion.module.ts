import { Module } from '@nestjs/common';
import { MotionService } from './motion.service';
import { MotionController } from './motion.controller';
import { SocketsModule } from '@sockets/sockets.module';

@Module({
  imports: [SocketsModule],
  controllers: [MotionController],
  providers: [MotionService],
})
export class MotionModule {}
