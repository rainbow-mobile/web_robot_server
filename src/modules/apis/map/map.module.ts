import { Module } from '@nestjs/common';
import { MapService } from './map.service';
import { MapController } from './map.controller';
import { SocketsModule } from '@sockets/sockets.module';

@Module({
  imports: [SocketsModule],
  controllers: [MapController],
  providers: [MapService],
})
export class MapModule {}
