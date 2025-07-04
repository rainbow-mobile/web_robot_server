import { LogService } from './log.service';
import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  Param,
  Res,
  Post,
  HttpStatus,
  Query,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import httpLogger from '@common/logger/http.logger';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { StatusTestDto } from './dto/status.dto';
import { LogReadDto } from './dto/log.read.dto';
import { PaginationResponse } from '@common/pagination/pagination.response';
import { errorToJson } from '@common/util/error.util';
import { RpcException } from '@nestjs/microservices';
import { homedir } from 'os';
import * as path from 'path';
import { deleteFile } from '@common/util/file.util';

@ApiTags('로그 관련 API (log)')
@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Status Log 조회',
    description: 'DB에 저장된 Status 리스트 반환',
  })
  async getStatus(@Query() param: LogReadDto, @Res() res: Response) {
    try {
      httpLogger.debug(`[LOG] getStatus Log`);
      const data = await this.logService.getStatus('status', param);
      res.send(data);
    } catch (error) {
      httpLogger.error(`[LOG] getStatus Log : ${errorToJson(error)}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
      });
    }
  }

  @Get('status/:key')
  async getStatusParam(@Param('key') key: string, @Res() res: Response) {
    try {
      httpLogger.debug(`[LOG] getStatusParam : ${key}`);
      const response = await this.logService.getStatusParam(key);
      res.send(response);
    } catch (error) {
      httpLogger.error(`[LOG] getStatusParam : ${key}, ${error.code}`);
      res.status(error.status).send(error.data);
    }
  }

  @Post('status/archive')
  async archiveStatus(@Res() res: Response) {
    try {
      httpLogger.debug(`[LOG] archiveStatus`);
      const response = await this.logService.archiveOldDataDay();
      res.send(response);
    } catch (error) {
      httpLogger.error(`[LOG] archiveStatus: ${errorToJson(error)}`);
      res.status(error.status).send(error.data);
    }
  }

  @Post('status')
  async emitTestStatus(@Body() data: StatusTestDto, @Res() res: Response) {
    try {
      httpLogger.debug(`[LOG] emitTestStatus: ${JSON.stringify(data)}`);
      await this.logService.emitStatusTest(data.time);
      res.send();
    } catch (error) {
      httpLogger.error(
        `[LOG] emitTestStatus: ${JSON.stringify(data)}, ${errorToJson(error)}`,
      );
      res.status(error.status).send(error.data);
    }
  }

  @Get('api')
  @ApiOperation({
    summary: 'API Log 조회',
    description: '파일로 저장된 API 로그 조회 ',
  })
  async getApiLog(@Query() param: LogReadDto, @Res() res: Response) {
    try {
      httpLogger.debug(`[LOG] getApiLog: ${JSON.stringify(param)}`);
      const response = await this.logService.getLogs('http', param);
      res.send(response);
    } catch (error) {
      httpLogger.error(
        `[LOG] getApiLog: ${JSON.stringify(param)}, ${errorToJson(error)}`,
      );
      res.status(error.status).send(error.data);
    }
  }

  @Get('socket')
  @ApiOperation({
    summary: 'Socket Log 조회',
    description: '파일로 저장된 Socket 로그 조회 ',
  })
  async getSocketLog(@Query() param: LogReadDto, @Res() res: Response) {
    try {
      httpLogger.debug(`[LOG] getSocketLog: ${JSON.stringify(param)}`);
      const response = await this.logService.getLogs('socket', param);

      res.send(response);
    } catch (error) {
      httpLogger.error(
        `[LOG] getSocketLog: ${JSON.stringify(param)}, ${errorToJson(error)}`,
      );
      res.status(error.status).send(error.data);
    }
  }

  @Get('alarmList')
  @ApiOperation({
    summary: '정의된 알람 리스트 조회',
  })
  async getAlarmDetails(@Res() res: Response) {
    try {
      const response = await this.logService.getAlarmDetails();
      res.send(response);
    } catch (error) {
      res.status(error.status).send(error.data);
    }
  }

  @Get('alarm')
  @ApiOperation({
    summary: '현재 활성화된 알람 리스트 조회',
  })
  async getAlarms() {
    try {
      httpLogger.debug(`[LOG] getAlarms`);
      const response = await this.logService.getAlarms();
      this.logService.setAlarmsFlag(response);
      const result = response.map(({ emitFlag, ...alarm }) => alarm);
      return result;
    } catch (error) {
      httpLogger.error(`[LOG] getAlarms: ${errorToJson(error)}`);
      if (error instanceof RpcException) throw error;
      throw new RpcException('서버에 에러가 발생했습니다.');
    }
  }

  @Get('alarm/all')
  @ApiOperation({
    summary: '알람 리스트(DB) 조회',
  })
  async getAlarmAll() {
    try {
      httpLogger.debug(`[LOG] getAlarmAll`);
      const response = await this.logService.getAlarmsAll();
      const result = response.map(({ emitFlag, ...alarm }) => alarm);
      return result;
    } catch (error) {
      httpLogger.error(`[LOG] getAlarmAll: ${errorToJson(error)}`);
      if (error instanceof RpcException) throw error;
      throw new RpcException('서버에 에러가 발생했습니다.');
    }
  }
  @Delete('alarm')
  async alarmReset() {
    try {
      return this.logService.resetAlarms();
    } catch (error) {
      httpLogger.error(`[LOG] alarmReset: ${errorToJson(error)}`);
      if (error instanceof RpcException) throw error;
      throw new RpcException('서버에 에러가 발생했습니다.');
    }
  }

  @Get('generalLog/:date')
  async getGeneralLog(@Param('date') date: string) {
    try {
      console.log('getGeneralLog : ', date);
      const _path = path.join(
        'data',
        'log',
        'samsung-em',
        date + '_ROBOT.log',
      );
      console.log('path : ', _path);
      return this.logService.readGeneralLog(_path);
    } catch (error) {
      console.error(error);
      if (error instanceof RpcException) throw error;
      throw new RpcException('서버에 에러가 발생했습니다.');
    }
  }

  @Delete('generalLog/:date')
  async deleteGeneralLog(@Param('date') date: string) {
    try {
      console.log('deleteGeneralLog : ', date);
      const _path = path.join(
        'data',
        'log',
        'samsung-em',
        date + '_ROBOT.log',
      );
      console.log('path : ', _path);
      return deleteFile(_path);
    } catch (error) {
      console.error(error);
      if (error instanceof RpcException) throw error;
      throw new RpcException('서버에 에러가 발생했습니다.');
    }
  }

  @Get('slamnav')
  async getSlamnavLog(@Query() param: LogReadDto, @Res() res: Response) {
    try {
      httpLogger.debug(`[LOG] getSlamnavLog: ${JSON.stringify(param)}`);
      res.send(new PaginationResponse(param.getOffset(), param.getLimit(), []));
    } catch (error) {
      httpLogger.error(
        `[LOG] getSlamnavLog: ${JSON.stringify(param)}, ${errorToJson(error)}`,
      );
      res.status(error.status).send(error.data);
    }
  }

  @Get('system')
  async getSystemLog(@Query() param: LogReadDto, @Res() res: Response) {
    try {
      httpLogger.debug(`[LOG] getSystemLog Log`);
      const data = await this.logService.getStatus('system', param);
      res.send(data);
    } catch (error) {
      httpLogger.error(`[LOG] getSystemLog Log : ${errorToJson(error)}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
      });
    }
  }

  @Get('system/cpu')
  async getSystemCpuLog(@Query() param: LogReadDto, @Res() res: Response) {
    try {
      httpLogger.debug(`[LOG] getSystemCpuLog Log`);
      const data = await this.logService.getSystemCpu(param);
      res.send(data);
    } catch (error) {
      httpLogger.error(`[LOG] getSystemCpuLog Log : ${errorToJson(error)}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
      });
    }
  }

  @Get('system/process')
  async getSystemProcessLog(@Query() param: LogReadDto, @Res() res: Response) {
    try {
      httpLogger.debug(`[LOG] getSystemProcessLog Log`);
      const data = await this.logService.getSystemProcess(param);
      res.send(data);
    } catch (error) {
      httpLogger.error(`[LOG] getSystemProcessLog Log : ${errorToJson(error)}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
      });
    }
  }

  @Get('system/current')
  async getSystemCurrent(@Res() res: Response) {
    try {
      const data = await this.logService.getSystemCurrent();
      res.send(data);
    } catch (error) {
      httpLogger.error(`[LOG] getSystemCurrent : ${errorToJson(error)}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
      });
    }
  }

  @Get('test/memory')
  async getMemoryUsage(@Res() res: Response) {
    try {
      this.logService.readMemoryUsage();
      res.send();
    } catch (error) {
      httpLogger.error(`[LOG] readMemoryUsage: ${JSON.stringify(error)}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
      });
    }
  }

  @Get(':key/:value')
  async getLogValueKey(
    @Param('key') key: string,
    @Param('value') value: string,
    @Res() res: Response,
  ) {
    try {
      httpLogger.debug(`[LOG] getLogValueKey: ${key}, ${value}`);
      const response = await this.logService.getStatusParam(key + '/' + value);
      res.send(response);
    } catch (error) {
      httpLogger.error(`[LOG] getLogValueKey: ${key}, ${errorToJson(error)}`);
      res.status(error.status).send(error.data);
    }
  }

  @Get(':key')
  async getLogKey(@Param('key') key: string, @Res() res: Response) {
    try {
      httpLogger.debug(`[LOG] getLogKey: ${key}`);
      const response = await this.logService.getStatusParam(key);
      res.send(response);
    } catch (error) {
      httpLogger.error(`[LOG] getLogKey: ${key}, ${errorToJson(error)}`);
      res.status(error.status).send(error.data);
    }
  }
}
