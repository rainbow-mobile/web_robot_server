import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { DownloadController, PublishController, UploadController } from './upload.controller';

@Module({
  controllers: [UploadController, PublishController, DownloadController],
  providers: [UploadService],
})
export class UploadModule {}
