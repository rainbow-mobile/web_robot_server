import { Controller, Get, Query, Res } from '@nestjs/common';
import { OnvifClientService } from './onvif_client.service';
import { Response } from 'express';

@Controller('onvif_client')
export class OnvifClientController {
  constructor(private readonly OnvifClientService: OnvifClientService) {}

  @Get()
  async test(@Res() res: Response) {
    this.OnvifClientService.discoverDevices();
    res.send();
  }

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
