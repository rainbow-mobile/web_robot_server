import { Module } from '@nestjs/common';
import { OnvifDeviceService } from './onvif.service';
import { OnvifDeviceController } from './onvif.controller';
import { SocketsModule } from '@sockets/sockets.module';
import { VariablesModule } from '../variables/variables.module';

@Module({
  imports: [SocketsModule, VariablesModule],
  providers: [OnvifDeviceService],
  controllers: [OnvifDeviceController],
  exports: [OnvifDeviceService],
})
export class OnvifDeviceModule {}
