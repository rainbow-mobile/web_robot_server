import { Injectable, OnModuleInit } from '@nestjs/common';
import * as onvif from 'node-onvif';

@Injectable()
export class OnvifClientService implements OnModuleInit {
  private service: onvif.onvifService;

  async onModuleInit() {
    console.log('Starting ONVIF discovery...');
    // await this.discoverDevices();
    setInterval(() => {
      // this.discoverDevices();
    }, 1000);

    // const d = onvif.onvifService();
  }

  async discoverDevices() {
    console.log('Searching for ONVIF devices...');
    const devices = await onvif.startProbe();
    devices.forEach((device) => {
      console.log(`Found ONVIF device: ${device.urn} at ${device.xaddrs}`);
    });
  }

  async connectToDevice(ip: string, username: string, password: string) {
    const device = new onvif.OnvifDevice({
      xaddr: `http://${ip}:80/onvif/device_service`,
      user: username,
      pass: password,
    });

    await device.init();
    console.log(
      `Connected to ONVIF device: ${device.getInformation().Manufacturer}`,
    );

    return device;
  }

  async getSnapshot(ip: string, username: string, password: string) {
    const device = await this.connectToDevice(ip, username, password);
    const url = device.getSnapshotUri();
    console.log(`Snapshot URL: ${url}`);
    return url;
  }
}
