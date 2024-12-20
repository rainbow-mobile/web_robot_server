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
        httpLogger.error(`mapping/start Error : ${error.status} -> ${error.data}`);
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
        httpLogger.error(`mapping/stop Error : ${error.status} -> ${error.data}`);
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
          httpLogger.warn(`Mapping Save Parameter Missing : name`)
          return res.status(HttpStatus.BAD_REQUEST).send({message:'Mapping Save Parameter Missing : name'});
        }
        const response = await this.controlService.mappingCommand({command:"save",name:name, time:Date.now().toString()});
        return res.send(response);
      }catch(error){
        httpLogger.error(`mapping/save Error : ${error.status} -> ${error.data}`);
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
        httpLogger.error(`mapping/reload Error : ${error.status} -> ${error.data}`);
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
        if(data.command == "init"){
          if(data.x == "" || data.y == "" || data.rz == ""){
            httpLogger.warn(`Localization Parameter Missing : x, y, rz`)
            return res.status(HttpStatus.BAD_REQUEST).send({message:`Localization Parameter Missing : x, y, rz`});
          }
        }else if(data.command == "autoinit" || data.command == "semiautoinit"){

        }else if(data.command == "start" || data.command == "stop"){
        }else{
          httpLogger.warn(`Localization Command Unknown : ${data.command}`)
          return res.status(HttpStatus.BAD_REQUEST).send({message:`Localization Command Unknown : ${data.command}`});
        }
        const response = await this.controlService.Localization({...data, time:Date.now().toString()});
        return res.send(response);

      }catch(error){
        httpLogger.error(`mapping/save Error : ${error.status} -> ${error.data}`);
        return res.status(error.status).send(error.data);
      }
    }

}
