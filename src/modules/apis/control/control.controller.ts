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
  import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
  } from '@nestjs/swagger';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { ControlService } from './control.service';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import httpLogger from '@common/logger/http.logger';
import { Response } from 'express';
import { MoveCommandDto } from 'src/modules/apis/move/dto/move.command.dto';
import { LocalizationDto } from 'src/modules/apis/control/dto/localization.command.dto';
import { errorToJson } from '@common/util/error.util';
import { LedControlDto } from './dto/led.control.dto';
import { LidarControlDto } from './dto/lidar.control.dto';
import { MotorControlDto } from './dto/motor.control.dto';

@ApiTags('SLAMNAV 명령 관련 (control)')
@Controller('control')
export class ControlController {
    constructor(private readonly socketGateway: SocketGateway) {}

    @Inject()
    private readonly controlService: ControlService;

    @Get('mapping/start')
    @ApiOperation({
      summary: '매핑 시작',
      description: '매핑 시작 명령을 전달합니다'
    })
    @ApiResponse({
      status: 200,
      description: HttpStatusMessagesConstants.MAPPING.MAPPING_ACCEPT_200
    })
    async mappingStart(@Res() res: Response){
      try{
        const response = await this.controlService.mappingCommand({command:"start",time:Date.now().toString()});
        res.send(response);
      }catch(error){
        httpLogger.error(`[COMMAND] mapping start: ${error.status} -> ${errorToJson(error.data)}`);
        res.status(error.status).send(error.data);
      }
    }
    @Get('mapping/stop')
    @ApiOperation({
      summary: '매핑 종료',
      description: '매핑 종료 명령을 전달합니다'
    })
    @ApiResponse({
      status: 200,
      description: HttpStatusMessagesConstants.MAPPING.MAPPING_ACCEPT_200
    })
    async mappingStop(@Res() res: Response){
      try{
        const response = await this.controlService.mappingCommand({command:"stop",time:Date.now().toString()});
        res.send(response);
      }catch(error){
        httpLogger.error(`[COMMAND] mapping stop: ${error.status} ->${errorToJson(error.data)}`);
        res.status(error.status).send(error.data);
      }
    }

    @Get('mapping/save/:name')
    @ApiOperation({
      summary: '매핑 시작',
      description: '매핑 시작 명령을 전달합니다'
    })
    @ApiResponse({
      status: 200,
      description: HttpStatusMessagesConstants.MAPPING.MAPPING_ACCEPT_200
    })
    async mappingSave(@Param('name') name:string, @Res() res: Response){
      try{
        if(name == ""){
          httpLogger.warn(`[COMMAND] Mapping Save Parameter Missing : name`)
          return res.status(HttpStatus.BAD_REQUEST).send({message:'Mapping Save Parameter Missing : name'});
        }
        const response = await this.controlService.mappingCommand({command:"save",name:name, time:Date.now().toString()});
        return res.send(response);
      }catch(error){
        httpLogger.error(`[COMMAND] mapping save: ${name}, ${error.status} -> ${errorToJson(error.data)}`);
        return res.status(error.status).send(error.data);
      }
    }

    @Get('mapping/reload')
    @ApiOperation({
      summary: '매핑 데이터 리로드',
      description: '매핑 중인 데이터를 리로드 요청합니다'
    })
    @ApiResponse({
      status: 200,
      description: HttpStatusMessagesConstants.MAPPING.MAPPING_ACCEPT_200
    })
    async mappingReload(@Res() res: Response){
      try{
        const response = await this.controlService.mappingCommand({command:"reload",time:Date.now().toString()});
        res.send(response);
      }catch(error){
        httpLogger.error(`[COMMAND] mapping reload: ${error.status} -> ${errorToJson(error.data)}`);
        res.status(error.status).send(error.data);
      }
    }

    @Get('dock')
    @ApiOperation({
      summary: '도킹 시작',
      description: '도킹을 시작합니다(도킹 가능위치에서 실행해야함)'
    })
    @ApiResponse({
      status: 200,
      description: HttpStatusMessagesConstants.MAPPING.MAPPING_ACCEPT_200
    })
    async dockStart(@Res() res: Response){
      try{
        const response = await this.controlService.dockCommand({command:"dock",time:Date.now().toString()});
        res.send(response);
      }catch(error){
        httpLogger.error(`[COMMAND] dock start: ${error.status} -> ${errorToJson(error.data)}`);
        res.status(error.status).send(error.data);
      }
    }

    @Get('undock')
    @ApiOperation({
      summary: '도킹 해체',
      description: '도킹을 해체합니다(도킹중인 상태에서 실행해야함)'
    })
    @ApiResponse({
      status: 200,
      description: HttpStatusMessagesConstants.MAPPING.MAPPING_ACCEPT_200
    })
    async dockStop(@Res() res: Response){
      try{
        const response = await this.controlService.dockCommand({command:"undock",time:Date.now().toString()});
        res.send(response);
      }catch(error){
        httpLogger.error(`[COMMAND] undock start: ${error.status} -> ${errorToJson(error.data)}`);
        res.status(error.status).send(error.data);
      }
    }

    @Post('localization')
    @ApiOperation({
      summary: '위치초기화',
      description: '위치초기화 명령을 전달합니다'
    })
    @ApiResponse({
      status: 200,
      description: HttpStatusMessagesConstants.MAPPING.MAPPING_ACCEPT_200
    })
    async localization(@Body() data:LocalizationDto, @Res() res: Response){
      try{
        httpLogger.info(`[COMMAND] Localization: ${JSON.stringify(data)}`)
        if(data.command == "init"){
          if(data.x == "" || data.y == "" || data.rz == ""){
            httpLogger.warn(`[COMMAND] Localization Parameter Missing : x, y, rz`)
            return res.status(HttpStatus.BAD_REQUEST).send({message:`Localization Parameter Missing : x, y, rz`});
          }
        }else if(data.command == "autoinit" || data.command == "semiautoinit"){

        }else if(data.command == "start" || data.command == "stop"){
        }else{
          httpLogger.warn(`[COMMAND] Localization Command Unknown : ${data.command}`)
          return res.status(HttpStatus.BAD_REQUEST).send({message:`Localization Command Unknown : ${data.command}`});
        }
        const response = await this.controlService.Localization({...data, time:Date.now().toString()});
        return res.send(response);

      }catch(error){
        httpLogger.error(`[COMMAND] localization: ${error.status} -> ${errorToJson(error.data)} ${JSON.stringify(data)}`);
        return res.status(error.status).send(error.data);
      }
    }

    @Post('led')
    @ApiOperation({
      summary: 'LED 제어',
      description: 'LED 색을 변경합니다'
    })
    async ledControl(@Body() data:LedControlDto, @Res() res: Response){
      try{
        httpLogger.info(`[COMMAND] LED Control : ${data.command}, ${data.led}`)
        const response = await this.controlService.ledControl(data);
        res.send(response);
      }catch(error){
        httpLogger.error(`[COMMAND] LED Control : ${error.status} -> ${errorToJson(error.data)} ${JSON.stringify(data)}`);
        return res.status(error.status).send(error.data);
      }
    }

    @Post('lidar')
    @ApiOperation({
      summary: 'Lidar 전송 주기 제어',
      description: 'Lidar 전송 주기를 변경합니다'
    })
    async lidarControl(@Body() data:LidarControlDto, @Res() res: Response){
      try{
        httpLogger.info(`[COMMAND] Lidar Control : ${data.command}, ${data.frequency}`)
        const response = await this.controlService.sendCommand("lidarOnOff",data);
        res.send(response);
      }catch(error){
        httpLogger.error(`[COMMAND] Lidar Control: ${error.status} -> ${errorToJson(error.data)} ${JSON.stringify(data)}`);
        return res.status(error.status).send(error.data);
      }
    }

    @Post('path')
    @ApiOperation({
      summary: 'Lidar 전송 주기 제어',
      description: 'Lidar 전송 주기를 변경합니다'
    })
    async pathControl(@Body() data:LidarControlDto, @Res() res: Response){
      try{
        httpLogger.info(`[COMMAND] Path Control : ${data.command}, ${data.frequency}`)
        const response = await this.controlService.sendCommand("pathOnOff",data);
        res.send(response);
      }catch(error){
        httpLogger.error(`[COMMAND] Path Control: ${error.status} -> ${errorToJson(error.data)} ${JSON.stringify(data)}`);
        return res.status(error.status).send(error.data);
      }
    }

    @Post('motor')
    @ApiOperation({
      summary: 'MOTOR on/off',
      description: 'MOTOR 전원을 켜거나 끕니다'
    })
    async motorControl(@Body() data:MotorControlDto, @Res() res: Response){
      try{
        httpLogger.info(`[COMMAND] Motor Control : ${data.command}`)
        const response = await this.controlService.sendCommand("motor",data);
        res.send(response);
      }catch(error){
        httpLogger.error(`[COMMAND] Motor Control: ${error.status} -> ${errorToJson(error.data)} ${JSON.stringify(data)}`);
        return res.status(error.status).send(error.data);
      }
    }

    @Post('randomseq')
    @ApiOperation({
      summary: 'Random Sequence Start',
      description: '랜덤한 노드를 반복순회합니다 (초기화 필수)'
    })
    async randomSeqStart(@Res() res: Response){
      try{
        httpLogger.info(`[COMMAND] RandomSeq Control `)
        const response = await this.controlService.sendCommand("randomseq",{command:"randomseq"});
        res.send(response);
      }catch(error){
        httpLogger.error(`[COMMAND] RandomSeq Control: ${error.status} -> ${errorToJson(error.data)}`);
        return res.status(error.status).send(error.data);
      }
    }



}
