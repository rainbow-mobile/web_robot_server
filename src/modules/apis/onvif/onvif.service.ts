import { Injectable, OnModuleInit } from '@nestjs/common';
import * as onvif from 'node-onvif';

@Injectable()
export class OnvifDeviceService implements OnModuleInit {
  onModuleInit() {
    throw new Error('Method not implemented.');
  }
    
}
