import { Module } from '@nestjs/common';
import { TaskController } from '@task/task.controller';
import { TaskService } from '@task/task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketsModule } from '@sockets/sockets.module';

@Module({
  imports: [SocketsModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
