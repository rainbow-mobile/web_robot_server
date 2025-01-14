import { LogService } from './log.service';
import { Response } from 'express';
import { Body, Controller, Get, Param, Res, Patch, Put, Delete, Post, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import httpLogger from '@common/logger/http.logger';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { StatusLogEntity } from './entity/status.entity';
import { StatusTestDto } from './dto/status.dto';
import * as pako from 'pako';
import { LogReadDto } from './dto/log.read.dto';
import { PaginationResponse } from '@common/pagination/pagination.response';
import { errorToJson } from '@common/util/error.util';

@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  // @Get('state')
  // @ApiOperation({
  //   summary:'State Log 조회',
  //   description:'DB에 저장된 State 리스트 반환 (오늘 날짜)'
  // })
  // async getState(@Res() res: Response){
  //   const result =  await this.logService.getState();
  //   res.send(result);
  // }

  // @Get('power')
  // async getPower(@Res() res: Response){
  //   res.send(await this.logService.getPower());
  // }

  @Get('status')
  @ApiOperation({
    summary:'Status Log 조회',
    description:'DB에 저장된 Status 리스트 반환'
  })
  async getStatus(@Query() param: LogReadDto, @Res() res: Response){
    try{
      httpLogger.debug(`[LOG] getStatus Log`);
      const data = await this.logService.getStatus(param);
      res.send(data);
    }catch(error){
      httpLogger.error(`[LOG] getStatus Log : ${errorToJson(error)}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message:HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500});
    }
  }

  @Get('status/:key')
  async getStatusParam(@Param('key') key:string, @Res() res: Response){
    try{
      httpLogger.debug(`[LOG] getStatusParam : ${key}`)
      const response = await this.logService.getStatusParam(key);
      res.send(response);
    }catch(error){
      httpLogger.error(`[LOG] getStatusParam : ${key}, ${error.code}`)
      res.status(error.status).send(error.data);
    }
  }

  @Post('status/archive')
  async archiveStatus(@Res() res: Response){
    try{
      httpLogger.debug(`[LOG] archiveStatus`)
      const response = await this.logService.archiveOldDataDay();
      res.send(response);
    }catch(error){
      httpLogger.error(`[LOG] archiveStatus: ${errorToJson(error)}`)
      res.status(error.status).send(error.data);
    }
  }

  @Post('status')
  async emitTestStatus(@Body() data:StatusTestDto, @Res() res:Response){
    try{
      httpLogger.debug(`[LOG] emitTestStatus: ${JSON.stringify(data)}`)
      await this.logService.emitStatusTest(data.time);
      res.send();
    }catch(error){
      httpLogger.error(`[LOG] emitTestStatus: ${JSON.stringify(data)}, ${errorToJson(error)}`)
      res.status(error.status).send(error.data);
    }
  }

  @Get('api')
  @ApiOperation({
    summary:'API Log 조회',
    description:'파일로 저장된 API 로그 조회 '
  })
  async getApiLog(@Query() param: LogReadDto, @Res() res: Response){
    try{
      httpLogger.debug(`[LOG] getApiLog: ${JSON.stringify(param)}`)
      const response = await this.logService.getLogs('http',param);
      res.send(response);
    }catch(error){
      httpLogger.error(`[LOG] getApiLog: ${JSON.stringify(param)}, ${errorToJson(error)}`)
      res.status(error.status).send(error.data);
    }
  }

  @Get('socket')
  @ApiOperation({
    summary:'Socket Log 조회',
    description:'파일로 저장된 Socket 로그 조회 '
  })
  async getSocketLog(@Query() param: LogReadDto, @Res() res: Response){
    try{
      httpLogger.debug(`[LOG] getSocketLog: ${JSON.stringify(param)}`)
      const response = await this.logService.getLogs('socket',param);
      
      res.send(response);
    }catch(error){
      httpLogger.error(`[LOG] getSocketLog: ${JSON.stringify(param)}, ${errorToJson(error)}`)
      res.status(error.status).send(error.data);
    }
  }

  @Get('slamnav')
  async getSlamnavLog(@Query() param: LogReadDto, @Res() res: Response){
    try{
      httpLogger.debug(`[LOG] getSlamnavLog: ${JSON.stringify(param)}`)      
      res.send(new PaginationResponse(param.getOffset(), param.getLimit(), []));
    }catch(error){
      httpLogger.error(`[LOG] getSlamnavLog: ${JSON.stringify(param)}, ${errorToJson(error)}`)
      res.status(error.status).send(error.data);
    }
  }

  @Get(':key/:value')
  async getLogValueKey(@Param('key') key:string, @Param('value') value:string, @Res() res: Response){
    try{
      httpLogger.debug(`[LOG] getLogValueKey: ${key}, ${value}`)
      const response = await this.logService.getStatusParam(key+"/"+value);
      res.send(response);
    }catch(error){
      httpLogger.error(`[LOG] getLogValueKey: ${key}, ${errorToJson(error)}`)
      res.status(error.status).send(error.data);
    }
  }
  
  @Get(':key')
  async getLogKey(@Param('key') key:string, @Res() res: Response){
    try{
      httpLogger.debug(`[LOG] getLogKey: ${key}`)
      const response = await this.logService.getStatusParam(key);
      res.send(response);
    }catch(error){
      httpLogger.error(`[LOG] getLogKey: ${key}, ${errorToJson(error)}`)
      res.status(error.status).send(error.data);
    }
  }
}
