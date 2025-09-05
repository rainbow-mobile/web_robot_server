import { Module } from '@nestjs/common';
import { SocketsModule } from '@sockets/sockets.module';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';

@Module({
    imports:[SocketsModule],
    providers:[ConfigService],
    controllers:[ConfigController],
})
export class ConfigApiModule {}