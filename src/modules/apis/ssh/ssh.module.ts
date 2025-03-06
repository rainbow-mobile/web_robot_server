import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketsModule } from '@sockets/sockets.module';
import { SSHService } from './ssh.service';
import { SSHController } from './ssh.controller';

@Module({
  imports: [SocketsModule],
  controllers: [SSHController],
  providers: [SSHService],
})
export class SSHModule {}
