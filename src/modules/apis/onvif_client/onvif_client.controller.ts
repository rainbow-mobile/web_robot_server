import { Controller, Get, Query } from '@nestjs/common';
import { OnvifClientService } from './onvif_client.service';

@Controller('onvif')
export class OnvifClientController {
  constructor(private readonly OnvifClientService: OnvifClientService) {}

  @Get('discover')
  async discoverDevices() {
    return await this.OnvifClientService.discoverDevices();
  }

  @Get('snapshot')
  async getSnapshot(
    @Query('ip') ip: string,
    @Query('user') user: string,
    @Query('pass') pass: string,
  ) {
    return await this.OnvifClientService.getSnapshot(ip, user, pass);
  }
}
