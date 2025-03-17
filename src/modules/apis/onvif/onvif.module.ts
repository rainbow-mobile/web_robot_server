import { Module } from '@nestjs/common';
import { OnvifDeviceService } from './onvif.service';

@Module({
  providers: [OnvifDeviceService],
  exports: [OnvifDeviceService],
})
export class OnvifDeviceModule {}
