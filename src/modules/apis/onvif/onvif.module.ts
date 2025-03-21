import { Module } from '@nestjs/common';
import { OnvifDeviceService } from './onvif.service';
import { OnvifDeviceController } from './onvif.controller';
import { WSDiscoveryService } from './ws-discovery.service';

@Module({
  providers: [WSDiscoveryService, OnvifDeviceService],
  controllers: [OnvifDeviceController],
  exports: [OnvifDeviceService],
})
export class OnvifDeviceModule {}
