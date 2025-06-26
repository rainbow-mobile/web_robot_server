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
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as os from 'os';
import { OnvifDeviceService } from './onvif.service';
import * as xml2js from 'xml2js';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import httpLogger from '@common/logger/http.logger';
import { errorToJson } from '@common/util/error.util';
import { exec } from 'child_process';
import * as fs from 'fs';

@Controller('onvif')
export class OnvifDeviceController implements OnModuleInit {
  constructor(private readonly OnvifDeviceService: OnvifDeviceService) {}

  onModuleInit() {}

  @Post('device_service')
  @UsePipes(
    new ValidationPipe({ transform: false, forbidNonWhitelisted: false }),
  )
  async DeviceService(
    @RawBody() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log('?');
    const parser = new xml2js.Parser({
      explicitArray: false,
      tagNameProcessors: [xml2js.processors.stripPrefix],
    });

    parser.parseString(body, async (err, result) => {
      if (err) {
        httpLogger.error(
          `[ONVIF] Request Device Service : Parsing Error -> ${JSON.stringify(body)}, ${errorToJson(err)}`,
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
        `[ONVIF] Request Device Service : ${methodName}, ${JSON.stringify(result)}`,
      );

      let responseXml;
      if (methodName == 'GetSystemDateAndTime') {
        responseXml = await this.OnvifDeviceService.responseSystemDateAndTime();
      } else if (methodName == 'GetCapabilities') {
        responseXml = await this.OnvifDeviceService.responseCapabilities(
          req.socket.remoteAddress,
        );
      } else if (methodName == 'SetSystemDateAndTime') {
        responseXml = await this.OnvifDeviceService.setSystemDateAndTime();
      } else if (methodName == 'GetServiceCapabilities') {
        responseXml = await this.OnvifDeviceService.responseCapabilities(
          req.socket.remoteAddress,
        );
      } else if (methodName == 'GetServices') {
        responseXml = await this.OnvifDeviceService.responseServices(
          req.socket.remoteAddress,
        );
      } else if (methodName == 'GetDeviceInformation') {
        responseXml = await this.OnvifDeviceService.responseDeviceInformation();
      } else if (methodName == 'GetScopes') {
        responseXml = await this.OnvifDeviceService.responseScopes();
      } else if (methodName == 'GetNetworkInterfaces') {
        responseXml = await this.OnvifDeviceService.responseNetworkInterfaces(
          req.socket.remoteAddress,
        );
      } else if (methodName == 'GetDNS') {
        responseXml = await this.OnvifDeviceService.responseDNS(
          req.socket.remoteAddress,
        );
      } else if (methodName == 'GetHostname') {
        responseXml = await this.OnvifDeviceService.responseHostname();
      } else if (methodName == 'GetNetworkProtocols') {
        responseXml = await this.OnvifDeviceService.responseNetworkProtocols();
      } else if (methodName == 'GetDiscoveryMode') {
        responseXml = await this.OnvifDeviceService.responseDiscoveryMode();
      } else if (methodName == 'GetNetworkDefaultGateway') {
        responseXml = await this.OnvifDeviceService.responseDefaultGateway(
          req.socket.remoteAddress,
        );
      } else if (methodName == 'GetNTP') {
        responseXml = await this.OnvifDeviceService.responseNTP();
      }
      if (responseXml) {
        res.set('Content-Type', 'application/soap+xml');
        res.send(responseXml);
      } else {
        httpLogger.error(`methodName not matching ${methodName}`);
        res
          .status(HttpStatus.BAD_REQUEST)
          .send(HttpStatusMessagesConstants.INVALID_DATA_400);
      }
    });
  }

  @Post('media_service')
  @UsePipes(
    new ValidationPipe({ transform: false, forbidNonWhitelisted: false }),
  )
  async MediaService(
    @RawBody() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.error('media_service : ', JSON.stringify(body));

    const parser = new xml2js.Parser({
      explicitArray: false,
      tagNameProcessors: [xml2js.processors.stripPrefix],
    });

    parser.parseString(body, async (err, result) => {
      if (err) {
        httpLogger.error(
          `[ONVIF] Request Media Service : Parsing Error -> ${JSON.stringify(body)}, ${errorToJson(err)}`,
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
        `[ONVIF] Request Media Service : ${methodName}, ${JSON.stringify(result)}`,
      );

      let responseXml;
      if (methodName == 'GetProfiles') {
        responseXml = await this.OnvifDeviceService.responseMediaProfiles();
      } else if (methodName == 'GetStreamUri') {
        responseXml = await this.OnvifDeviceService.responseStreamUri(
          req.socket.remoteAddress,
        );
      } else if (methodName == 'GetVideoSources') {
        responseXml = await this.OnvifDeviceService.responseVideoSources();
      } else if (methodName == 'GetAudioSources') {
        responseXml = await this.OnvifDeviceService.responseAudioSources();
      } else if (methodName == 'GetSnapshotUri') {
        responseXml = await this.OnvifDeviceService.responseSnapshotUri(
          req.socket.remoteAddress,
        );
      } else if (methodName == 'GetProfile') {
        responseXml = await this.OnvifDeviceService.responseMediaProfile();
      } else if (methodName == 'GetNodes') {
        console.log('error?!');
        // responseXml = await this.OnvifDeviceService.responseNodes();
      } else if (methodName == 'GetVideoSourceConfiguration') {
        responseXml =
          await this.OnvifDeviceService.responseVideoSourceConfiguration();
      }

      if (responseXml) {
        res.set('Content-Type', 'application/soap+xml');
        res.send(responseXml);
      } else {
        httpLogger.error(`methodName not matching ${methodName}`);
        res
          .status(HttpStatus.BAD_REQUEST)
          .send(HttpStatusMessagesConstants.INVALID_DATA_400);
      }
    });
  }

  @Get('snapshot.jpg')
  async getSnapshot(@Res() res: Response) {
    httpLogger.info(`[ONVIF] getSnapshot`);

    fs.readFile('/data/snapshot.jpg', (err, data) => {
      if (err) {
        res.status(500).send('Error reading snapshot');
        return;
      }
      httpLogger.info(`[ONVIF] getSnapshot Done`);

      res.setHeader('Content-Type', 'image/jpeg');
      res.send(data);
    });
  }

  @Get('snapshot1.jpg')
  async getSnapshot1(@Res() res: Response) {
    httpLogger.info(`[ONVIF] getSnapshot`);
    exec(
      'ffmpeg -y -i rtsp://localhost:8554/cam0 -frames:v 1 snapshot.jpg',
      (error) => {
        if (error) {
          res.status(500).send('Error capturing snapshot');
          return;
        }

        fs.readFile('snapshot.jpg', (err, data) => {
          if (err) {
            res.status(500).send('Error reading snapshot');
            return;
          }
          httpLogger.info(`[ONVIF] getSnapshot Done`);

          res.setHeader('Content-Type', 'image/jpeg');
          res.send(data);
        });
      },
    );
  }

  @Post('ptz_service')
  @UsePipes(
    new ValidationPipe({ transform: false, forbidNonWhitelisted: false }),
  )
  async PTZService(
    @RawBody() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.error('ptz_service : ', JSON.stringify(body));

    const parser = new xml2js.Parser({
      explicitArray: false,
      tagNameProcessors: [xml2js.processors.stripPrefix],
    });

    parser.parseString(body, async (err, result) => {
      if (err) {
        httpLogger.error(
          `[ONVIF] Request Media Service : Parsing Error -> ${JSON.stringify(body)}, ${errorToJson(err)}`,
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
        `[ONVIF] Request PTZ Service : ${methodName}, ${JSON.stringify(result)}`,
      );

      let responseXml;
      if (methodName == 'ContinuousMove') {
        const token =
          result['Envelope']['Body']['ContinuousMove']['ProfileToken'];
        if (
          result['Envelope']['Body']['ContinuousMove']['Velocity']['PanTilt']
        ) {
          const x =
            result['Envelope']['Body']['ContinuousMove']['Velocity']['PanTilt'][
              '$'
            ].x;
          const y =
            result['Envelope']['Body']['ContinuousMove']['Velocity']['PanTilt'][
              '$'
            ].y;
          httpLogger.info(
            `[ONVIF] PTZ Move PanTilt : ${token}, Velocity(${x}, ${y})`,
          );
        } else if (
          result['Envelope']['Body']['ContinuousMove']['Velocity']['Zoom']
        ) {
          const velocity =
            result['Envelope']['Body']['ContinuousMove']['Velocity']['Zoom'][
              '$'
            ].x;
          httpLogger.info(
            `[ONVIF] PTZ Move Zoom : ${token}, Velocity(${velocity})`,
          );
        }
        responseXml = await this.OnvifDeviceService.responsePTZMove(
          '<ptz:ContinuousMoveResponse/>',
        );
      } else if (methodName == 'RelativeMove') {
        const token =
          result['Envelope']['Body']['RelativeMove']['ProfileToken'];
        const pantilt =
          result['Envelope']['Body']['RelativeMove']['Translation'][
            'PanTilt'
          ]?.['$'];
        const zoom =
          result['Envelope']['Body']['RelativeMove']['Translation']['Zoom']?.[
            '$'
          ];
        const pantilt_vel =
          result['Envelope']['Body']['RelativeMove']['Speed']?.['PanTilt']?.[
            '$'
          ];
        const zoom_vel =
          result['Envelope']['Body']['RelativeMove']['Speed']?.['Zoom']?.['$'];
        httpLogger.info(
          `[ONVIF] PTZ Move RelativeMove : ${token}, PanTilt(${pantilt?.x},${pantilt?.y}), Zoom(${zoom?.x}), PanTiltSpeed(${pantilt_vel?.x},${pantilt_vel?.y}), ZoomSpeed(${zoom_vel?.x})`,
        );
        responseXml = await this.OnvifDeviceService.responsePTZMove(
          '<ptz:RelativeMoveResponse/>',
        );
      } else if (methodName == 'AbsoluteMove') {
        const token =
          result['Envelope']['Body']['AbsoluteMove']['ProfileToken'];
        const pantilt =
          result['Envelope']['Body']['AbsoluteMove']['Position']['PanTilt'][
            '$'
          ];
        const zoom =
          result['Envelope']['Body']['AbsoluteMove']['Position']['Zoom']['$'];
        const pantilt_vel =
          result['Envelope']['Body']['AbsoluteMove']['Speed']?.['PanTilt']?.[
            '$'
          ];
        const zoom_vel =
          result['Envelope']['Body']['AbsoluteMove']['Speed']?.['Zoom']?.['$'];
        httpLogger.info(
          `[ONVIF] PTZ Move AbsoluteMove : ${token}, PanTilt(${pantilt.x},${pantilt.y}), Zoom(${zoom.x}), PanTiltSpeed(${pantilt_vel?.x},${pantilt_vel?.y}), ZoomSpeed(${zoom_vel?.x})`,
        );
        responseXml = await this.OnvifDeviceService.responsePTZMove(
          '<ptz:AbsoluteMoveResponse/>',
        );
      } else if (methodName == 'Stop') {
        const token = result['Envelope']['Body']['Stop']['ProfileToken'];
        const pantilt = result['Envelope']['Body']['Stop']['PanTilt'];
        const zoom = result['Envelope']['Body']['Stop']['Zoom'];
        httpLogger.info(
          `[ONVIF] PTZ Move Stop : ${token}, PanTilt(${pantilt}), Zoom(${zoom})`,
        );
        responseXml = await this.OnvifDeviceService.responsePTZMove(
          '<ptz:StopResponse/>',
        );
      } else if (methodName == 'GotoHomePosition') {
        const token =
          result['Envelope']['Body']['GotoHomePosition']['ProfileToken'];
        httpLogger.info(`[ONVIF] PTZ Move GotoHomePosition : ${token}`);
      } else if (methodName == 'SetHomePosition') {
        const token =
          result['Envelope']['Body']['SetHomePosition']['ProfileToken'];
        httpLogger.info(`[ONVIF] PTZ Move SetHomePosition : ${token}`);
      } else if (methodName == 'SetPreset') {
        const token = result['Envelope']['Body']['SetPreset']['ProfileToken'];
        const name = result['Envelope']['Body']['SetPreset']['PresetName'];
        httpLogger.info(`[ONVIF] PTZ Move SetPreset : ${token}, ${name}`);
      }

      if (responseXml) {
        res.set('Content-Type', 'application/soap+xml');
        res.send(responseXml);
      } else {
        httpLogger.error(`methodName not matching ${methodName}`);
        res
          .status(HttpStatus.BAD_REQUEST)
          .send(HttpStatusMessagesConstants.INVALID_DATA_400);
      }
    });
  }

  @Post('deviceio_service')
  @UsePipes(
    new ValidationPipe({ transform: false, forbidNonWhitelisted: false }),
  )
  async DeviceIOService(
    @RawBody() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.error('deviceio_service : ', JSON.stringify(body));

    res.set('Content-Type', 'application/soap+xml');
    res.send();
  }

  @Post('event_service')
  @UsePipes(
    new ValidationPipe({ transform: false, forbidNonWhitelisted: false }),
  )
  async EventService(
    @RawBody() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.error('event_service : ', JSON.stringify(body));

    res.set('Content-Type', 'application/soap+xml');
    res.send();
  }
}
