import { Module } from '@nestjs/common';
import { OnvifService } from './onvif.service';

@Module({
  providers: [OnvifService],
  exports: [OnvifService],
})
export class OnvifModule {}
