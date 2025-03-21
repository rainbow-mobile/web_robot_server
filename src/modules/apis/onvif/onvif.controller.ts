import {
  Controller,
  OnModuleInit,
  Post,
  Req,
  RawBody,
  Res,
  UsePipes,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { OnvifDeviceService } from './onvif.service';
import * as xml2js from 'xml2js';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import httpLogger from '@common/logger/http.logger';
import { errorToJson } from '@common/util/error.util';

@Controller('onvif')
export class OnvifDeviceController implements OnModuleInit {
  constructor(private readonly OnvifDeviceService: OnvifDeviceService) {}

  onModuleInit() {}

  @Post('device_service')
  @UsePipes(
    new ValidationPipe({ transform: false, forbidNonWhitelisted: false }),
  )
  async getDeviceInfo(
    @RawBody() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const parser = new xml2js.Parser({
      explicitArray: false,
      tagNameProcessors: [xml2js.processors.stripPrefix],
    });

    parser.parseString(body, async (err, result) => {
      if (err) {
        httpLogger.error(
          `[ONVIF] Request Device Info : Parsing Error -> ${JSON.stringify(body)}, ${errorToJson(err)}`,
        );
        res
          .status(HttpStatus.BAD_REQUEST)
          .send(HttpStatusMessagesConstants.INVALID_DATA_400);
        return;
      }

      const methodName = Object.keys(result['Envelope']['Body']).find(
        (key) => key !== '$',
      );
      httpLogger.info(
        `[ONVIF] Request Device Info : ${methodName}, ${JSON.stringify(result)}`,
      );

      let responseXml;
      if (methodName == 'GetSystemDateAndTime') {
        responseXml = await this.OnvifDeviceService.responseSystemDateAndTime();
      } else if (methodName == 'GetCapabilities') {
        responseXml = await this.OnvifDeviceService.responseCapabilities();
      } else if (methodName == 'GetServices') {
        responseXml = await this.OnvifDeviceService.responseServices();
      } else if (methodName == 'GetDeviceInformation') {
        responseXml = await this.OnvifDeviceService.responseDeviceInformation();
      } else if (methodName == 'GetScopes') {
        responseXml = await this.OnvifDeviceService.responseScopes();
      } else if (methodName == 'GetNetworkInterfaces') {
        responseXml = await this.OnvifDeviceService.responseNetworkInterfaces();
      }
      if (responseXml) {
        res.set('Content-Type', 'application/soap+xml');
        res.send(responseXml);
      } else {
        console.error(`methodName not matching ${methodName}`);
        res
          .status(HttpStatus.BAD_REQUEST)
          .send(HttpStatusMessagesConstants.INVALID_DATA_400);
      }
    });
  }

  @Post('media_service')
  async getStreamUri(@Req() req: Request, @Res() res: Response) {
    console.log('media_service');

    res.set('Content-Type', 'application/soap+xml');
    res.send();
  }
  @Post('event_service')
  async getEvents(@Req() req: Request, @Res() res: Response) {
    console.log('event_service');

    res.set('Content-Type', 'application/soap+xml');
    res.send();
  }
  @Post('ptz_service')
  async getPtz(@Req() req: Request, @Res() res: Response) {
    console.log('ptz_service');

    res.set('Content-Type', 'application/soap+xml');
    res.send();
  }
}
