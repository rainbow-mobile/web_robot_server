import { Module } from '@nestjs/common';
import { MoveService } from './move.service';
import { MoveController } from './move.controller';
import { SocketsModule } from '@sockets/sockets.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoveLogEntity } from './entity/move.entity';

@Module({
  imports: [
    SocketsModule,
    TypeOrmModule.forFeature([
      MoveLogEntity,
    ]),
  ],
  providers: [MoveService],
  controllers: [MoveController],
})
export class MoveModule {}
