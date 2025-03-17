import { Module } from '@nestjs/common';
import { OnvifClientService } from './onvif_client.service';

@Module({
  providers: [OnvifClientService],
  exports: [OnvifClientService],
})
export class OnvifClientModule {}
