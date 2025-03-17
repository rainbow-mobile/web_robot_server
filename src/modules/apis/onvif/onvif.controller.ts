import { Controller, Get, Query } from '@nestjs/common';
import { OnvifDeviceService } from './onvif.service';

@Controller('onvif')
export class OnvifDeviceController {
  constructor(private readonly OnvifDeviceService: OnvifDeviceService) {}

}
