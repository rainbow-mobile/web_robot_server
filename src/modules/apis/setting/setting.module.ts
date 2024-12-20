import { Module } from '@nestjs/common';
import { SettingService } from './setting.service';
import { SettingController } from './setting.controller';
import { SocketsModule } from '@sockets/sockets.module';

@Module({
  imports: [SocketsModule],
  controllers: [SettingController],
  providers: [SettingService],
})
export class SettingModule {}
