import {
  Controller,
  Get,
  Res,
  Put,
  Body,
  HttpStatus,
  OnModuleInit,
  Post,
  Param,
} from '@nestjs/common';
import httpLogger from '@common/logger/http.logger';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { SocketGateway } from './gateway/sockets.gateway';
import { VariablesService } from '../apis/variables/variables.service';
import { Response } from 'express';
import socketLogger from '@common/logger/socket.logger';
import { FrsUrlDto } from './dto/frs.url.dto';
import { errorToJson } from '@common/util/error.util';
import { EmitOnOffDto } from './dto/lidar.onoff.dto';
import { VariableDto } from '../apis/variables/dto/variables.dto';

@ApiTags('소켓 관련 API (Sockets)')
@Controller('sockets')
export class SocketsController implements OnModuleInit {
  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly variableService: VariablesService,
  ) {}

  onModuleInit() {
    console.log('socket init');
    this.getVariable();
    setTimeout(() => {
      this.conSocket();
    }, 5000);
  }

  async getVariable() {
    global.robotSerial = await this.variableService.getVariable('robotSerial');
    global.kafka_url = await this.variableService.getVariable('kafka_url');
    global.mqtt_url = await this.variableService.getVariable('mqtt_url');
    global.frs_socket = await this.variableService.getVariable('frs_socket');
    global.frs_api = await this.variableService.getVariable('frs_api');
    global.frs_url = await this.variableService.getVariable('frs_url');
  }

  async conSocket() {
    socketLogger.info(
      `[CONNECT] ConnectSocket : ${global.robotSn}, ${global.frs_socket}`,
    );
    this.socketGateway.connectFrsSocket(global.frs_socket);
  }

  @Get('frs/url')
  @ApiOperation({
    summary: 'FRS URL 조회',
    description:
      'DB에 저장된 FRS URL 정보 조회 url(URL), socket(SOCKETURL), api(APIURL)',
  })
  async getFrsUrl(@Res() res: Response) {
    try {
      if (!global.frs_url)
        global.frs_url = await this.variableService.getVariable('frs_url');
      if (!global.frs_api)
        global.frs_api = await this.variableService.getVariable('frs_api');
      if (!global.frs_socket)
        global.frs_socket =
          await this.variableService.getVariable('frs_socket');

      res.send({
        url: global.frs_url,
        socket: global.frs_socket,
        api: global.frs_api,
      });
    } catch (error) {
      httpLogger.error(`SOCKET] getFrsUrl: ${error.status} -> ${error.data}`);
      return res.status(error.status).send(error.data);
    }
  }

  @Put('frs/url')
  @ApiOperation({
    summary: 'FRS URL 변경',
    description: '입력된 url 값으로 FRS URL 변경 및 재연결시도',
  })
  async updateFrsUrl(@Body() data: FrsUrlDto, @Res() res: Response) {
    try {
      const url = data.url;
      httpLogger.info(`[SOCKET] set FRS URL: ${JSON.stringify(data)}`);
      if (url == '' || !url.includes('http://')) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: HttpStatusMessagesConstants.INVALID_DATA_400 });
      }

      global.kafka_url = url.replace('http://', '') + ':9092';
      global.mqtt_url = url.replace('http://', 'mqtt://') + ':1883';
      global.frs_url = url;
      global.frs_api = url + ':3000';
      global.frs_socket = url + ':3001/socket/robots';

      await this.variableService.upsertVariable('kafka_url', global.kafka_url);
      await this.variableService.upsertVariable('mqtt_url', global.mqtt_url);
      await this.variableService.upsertVariable('frs_url', global.frs_url);
      await this.variableService.upsertVariable('frs_api', global.frs_api);
      await this.variableService.upsertVariable(
        'frs_socket',
        global.frs_socket,
      );

      this.socketGateway.connectFrsSocket(global.frs_socket);
      res.send({ url: url, socket: global.frs_socket, api: global.frs_api });
    } catch (error) {
      httpLogger.error(
        `[SOCKET] set FRS URL: ${error.status} -> ${error.data}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Put('frs/url/test')
  @ApiOperation({
    summary: 'FRS URL 변경',
    description:
      '입력된 url 값으로 FRS URL 변경 및 재연결시도 (TEST버전으로 3010, 3011 포트로 연결)',
  })
  async updateFrsUrlTest(@Body() data: FrsUrlDto, @Res() res: Response) {
    try {
      const url = data.url;
      httpLogger.warn(`[SOCKET] update FRS URL Test: ${url}`);
      if (url == '' || !url.includes('http://')) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: HttpStatusMessagesConstants.INVALID_DATA_400 });
      }

      global.frs_url = url;
      global.frs_api = url + ':3010';
      global.frs_socket = url + ':3011/socket/robots';
      await this.variableService.upsertVariable('frs_url', global.frs_url);
      await this.variableService.upsertVariable('frs_api', global.frs_api);
      await this.variableService.upsertVariable(
        'frs_socket',
        global.frs_socket,
      );

      this.socketGateway.connectFrsSocket(global.frs_socket);
      res.send({ url: url, socket: global.frs_socket, api: global.frs_api });
    } catch (error) {
      httpLogger.error(
        `[SOCKET] update FRS URL Test: ${error.status} -> ${error.data}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Get('frs')
  @ApiOperation({
    summary: 'FRS 소켓 정보 요청',
    description:
      'connection(FRS연결상태), robotSerial(로봇시리얼넘버), name(로봇이름), url(URL), socket(SOCKETURL), api(APIURL)',
  })
  async getFrsInfo(@Res() res: Response) {
    try {
      if (!global.frs_url)
        global.frs_url = await this.variableService.getVariable('frs_url');
      if (!global.frs_api)
        global.frs_api = await this.variableService.getVariable('frs_api');
      if (!global.frs_socket)
        global.frs_socket =
          await this.variableService.getVariable('frs_socket');
      if (!global.mqtt_url)
        global.mqtt_url = await this.variableService.getVariable('mqtt_url');
      if (!global.kafka_url)
        global.kafka_url = await this.variableService.getVariable('kafka_url');

      res.send({
        connection: global.frsConnect,
        robotSerial: global.robotSerial,
        robotNm: global.robotNm,
        url: global.frs_url,
        mqtt: global.mqtt_url,
        kafka: global.kafka_url,
        kafka_connection: global.kafkaConnect,
        mqtt_connection: global.mqttConnect,
        socket: global.frs_socket,
        api: global.frs_api,
      });
    } catch (error) {
      httpLogger.error(`[SOCKET] get FRS: ${errorToJson(error)}`);
      return res.status(error.status).send(error.data);
    }
  }

  @Get('status')
  @ApiOperation({
    summary: '로봇 상태조회',
    description:
      'SLAMNAV에서 송신하는 status에 Task state, slam connection 추가하여 조회',
  })
  async getStatus(@Res() res: Response) {
    res.send({
      ...this.socketGateway.robotState,
      slam: this.socketGateway.slamnav ? true : false,
      task: this.socketGateway.taskState,
    });
  }

  @Post('lidar')
  @ApiOperation({
    summary: '라이다 통신 ON/Off',
    description: '라이다 소켓 통신 열기, frequency(통신주기)',
  })
  async lidarOn(@Body() data: EmitOnOffDto) {
    try {
      httpLogger.info(
        `[SOCKET] lidar OnOff: ${data.command} -> ${data.frequency}`,
      );
      this.socketGateway.slamnav.emit(
        'lidarOnOff',
        JSON.stringify({ ...data, time: Date.now().toString() }),
      );
    } catch (error) {
      httpLogger.error(`[SOCKET] lidar OnOff: ${errorToJson(error)}`);
    }
  }

  @Post('path')
  @ApiOperation({
    summary: '경로 통신 ON/Off',
    description: '경로 소켓 통신 열기, frequency(통신주기)',
  })
  async pathOn(@Body() data: EmitOnOffDto) {
    try {
      httpLogger.info(
        `[SOCKET] path OnOff: ${data.command} -> ${data.frequency}`,
      );
      this.socketGateway.slamnav.emit(
        'pathOnOff',
        JSON.stringify({ ...data, time: Date.now().toString() }),
      );
    } catch (error) {
      httpLogger.error(`[SOCKET] path OnOff: ${errorToJson(error)}`);
    }
  }

  @Post('serial')
  async setRobotSerial(@Body() data: VariableDto, @Res() res: Response) {
    try {
      httpLogger.info(`[SOCKET] setRobotSerial : ${data.key}, ${data.value}`);
      if (data.key == 'robotSerial') {
        await this.variableService.upsertVariable(data.key, data.value);
        global.robotSerial = data.value;
        this.conSocket();
        res.send({ robotSerial: data.value });
      } else {
        res
          .status(HttpStatus.BAD_REQUEST)
          .send(HttpStatusMessagesConstants.INVALID_DATA_400);
      }
    } catch (error) {
      httpLogger.error(
        `[SOCKET] setRobotSerial : ${data.key}, ${data.value}, ${errorToJson(error)}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Post('debug/:onoff')
  async setDebugMode(@Param('onoff') onoff: string, @Res() res: Response) {
    try {
      if (onoff == 'on') {
        this.socketGateway.setDebugMode(true);
      } else {
        this.socketGateway.setDebugMode(false);
      }
      res.send({ onoff: onoff });
    } catch (error) {
      httpLogger.error(
        `[SOCKET] setDebugMode : ${onoff}, ${errorToJson(error)}`,
      );
      return res.status(error.status).send(error.data);
    }
  }
}
