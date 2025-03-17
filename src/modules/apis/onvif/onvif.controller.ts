import { Controller, Get, Query } from '@nestjs/common';
import { OnvifService } from './onvif.service';

@Controller('onvif')
export class OnvifController {
  constructor(private readonly onvifService: OnvifService) {}

  @Get('discover')
  async discoverDevices() {
    return await this.onvifService.discoverDevices();
  }

  @Get('snapshot')
  async getSnapshot(
    @Query('ip') ip: string,
    @Query('user') user: string,
    @Query('pass') pass: string,
  ) {
    return await this.onvifService.getSnapshot(ip, user, pass);
  }
}
