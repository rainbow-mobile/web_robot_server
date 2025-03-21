import httpLogger from '@common/logger/http.logger';
import { errorToJson } from '@common/util/error.util';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class OnvifDeviceService implements OnModuleInit {
  private server: any;
  private service: any;
  onModuleInit() {}

  getQueryPath(filename: string) {
    return process.cwd() + '/src/modules/apis/onvif/query/' + filename;
  }

  async responseSystemDateAndTime() {
    return new Promise(async (resolve, reject) => {
      try {
        let query = fs
          .readFileSync(this.getQueryPath('dateandtime.xml'))
          .toString();

        const nowTime = new Date();
        query = query.replace(
          '__YEAR_UTC__',
          nowTime.getUTCFullYear().toString(),
        );
        query = query.replace(
          '__MONTH_UTC__',
          (nowTime.getUTCMonth() + 1).toString(),
        );
        query = query.replace('__DAY_UTC__', nowTime.getUTCDate().toString());
        query = query.replace('__HOUR_UTC__', nowTime.getUTCHours().toString());
        query = query.replace(
          '__MINUTE_UTC__',
          nowTime.getUTCMinutes().toString(),
        );
        query = query.replace(
          '__SECOND_UTC__',
          nowTime.getUTCSeconds().toString(),
        );
        query = query.replace('__YEAR__', nowTime.getFullYear().toString());
        query = query.replace('__MONTH__', (nowTime.getMonth() + 1).toString());
        query = query.replace('__DAY__', nowTime.getDate().toString());
        query = query.replace('__HOUR__', nowTime.getHours().toString());
        query = query.replace('__MINUTE__', nowTime.getMinutes().toString());
        query = query.replace('__SECOND__', nowTime.getSeconds().toString());

        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(
          `[ONVIF] responseSystemDateAndTime : ${errorToJson(error)}`,
        );
        reject();
      }
    });
  }

  async responseCapabilities() {
    return new Promise(async (resolve, reject) => {
      try {
        let query = fs
          .readFileSync(this.getQueryPath('capabilities.xml'))
          .toString();
        query = query.replace(
          '__DEVICE_SERVICE__',
          'http://192.168.1.88:11334/api/onvif/device_service',
        );
        query = query.replace(
          '__MEDIA_SERVICE__',
          'http://192.168.1.2:11334/api/onvif/media_service',
        );
        query = query.replace(
          '__EVENTS_SERVICE__',
          'http://192.168.1.2:11334/api/onvif/events_service',
        );
        query = query.replace(
          '__PTZ_SERVICE__',
          'http://192.168.1.2:11334/api/onvif/ptz_service',
        );
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(
          `[ONVIF] responseCapabilities : ${errorToJson(error)}`,
        );
        reject();
      }
    });
  }

  async responseServices() {
    return new Promise(async (resolve, reject) => {
      try {
        let query = fs
          .readFileSync(this.getQueryPath('services.xml'))
          .toString();
        query = query.replace(
          '__DEVICE_SERVICE__',
          'http://192.168.1.88:11334/api/onvif/device_service',
        );
        query = query.replace(
          '__MEDIA_SERVICE__',
          'http://192.168.1.2:11334/api/onvif/media_service',
        );
        query = query.replace(
          '__PTZ_SERVICE__',
          'http://192.168.1.2:11334/api/onvif/ptz_service',
        );
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(`[ONVIF] responseServices : ${errorToJson(error)}`);
        reject();
      }
    });
  }

  async responseDeviceInformation() {
    return new Promise(async (resolve, reject) => {
      try {
        let query = fs
          .readFileSync(this.getQueryPath('deviceinformation.wsdl'))
          .toString();
        query = query.replace('__MANUFACTURER__', 'RainbowRobotics');
        query = query.replace('__MODEL__', 'D400_LAKI');
        query = query.replace('__FIRMWARE__VERSION__', '1.1.1');
        query = query.replace('__SERIAL_NUMBER__', '23kngf0293pg33h3');
        query = query.replace('__HARDWARE_ID__', 'hello');
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(
          `[ONVIF] responseDeviceInformation : ${errorToJson(error)}`,
        );
        reject();
      }
    });
  }

  async responseScopes() {
    return new Promise(async (resolve, reject) => {
      try {
        const query = fs
          .readFileSync(this.getQueryPath('scopes.wsdl'))
          .toString();
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(`[ONVIF] responseScopes : ${errorToJson(error)}`);
        reject();
      }
    });
  }
  async responseNetworkInterfaces() {
    return new Promise(async (resolve, reject) => {
      try {
        const query = fs
          .readFileSync(this.getQueryPath('networkinterfaces.wsdl'))
          .toString();
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(
          `[ONVIF] responseNetworkInterfaces : ${errorToJson(error)}`,
        );
        reject();
      }
    });
  }
}
