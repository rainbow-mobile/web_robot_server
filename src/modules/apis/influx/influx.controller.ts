import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Inject,
    Param,
    Post,
    Put,
    Query,
    Res,
    UseGuards,
  } from '@nestjs/common';
  //   import { AuthGuard } from '@auth/security/auth.guard';
  import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
  } from '@nestjs/swagger';
  import * as os from 'os';
  import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
  import { Response } from 'express';
  import httpLogger from '@common/logger/http.logger';
  import { SocketGateway } from '@sockets/gateway/sockets.gateway';
  import path from 'path';
  import { errorToJson } from '@common/util/error.util';
  import { InfluxDBService } from './influx.service';
  
  @ApiTags('INFLUX 관련 API (influx)')
  @Controller('influx')
  export class INFLUXController {
    constructor(private readonly influxService:InfluxDBService) {
        
    }

    @Get(':time')
    async test(@Param('time') time:string, @Res() res:Response){
      await this.influxService.testStatus(time);
      res.send();
    }
    @Get()
    async sshConnect(@Res() res:Response){
        try{
            await this.influxService.writeData();
            res.send(await this.influxService.queryData('sensors','home'));
        }catch(error){
            console.error(error);
            res.send();
        }
    }
  }
  