import { Module } from '@nestjs/common';
import { SocketsModule } from '@sockets/sockets.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingService } from './setting.service';
import { SettingController } from './setting.controller';
import { SettingFileService } from './setting-file.service';
import { SettingFileController } from './setting-file.controller';

@Module({
  imports: [SocketsModule],
  providers: [SettingService, SettingFileService],
  controllers: [SettingController, SettingFileController],
  exports: [SettingService, SettingFileService],
})
export class SettingModule {}
