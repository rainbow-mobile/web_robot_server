import { Module } from '@nestjs/common';
import { OnvifClientService } from './onvif_client.service';
import { OnvifClientController } from './onvif_client.controller';

@Module({
  providers: [OnvifClientService],
  controllers: [OnvifClientController],
  exports: [OnvifClientService],
})
export class OnvifClientModule {}
