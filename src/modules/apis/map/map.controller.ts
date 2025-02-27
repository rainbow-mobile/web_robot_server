import { Body, Controller, Get, HttpStatus, Inject, Param, Post, Query, Res } from '@nestjs/common';
import { MapService } from './map.service';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import httpLogger from '@common/logger/http.logger';
import { Response } from 'express';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { GoalReadDto } from './dto/goal.read.dto';
import { errorToJson } from '@common/util/error.util';
import { PaginationResponse } from '@common/pagination/pagination.response';
import { isNumber } from 'class-validator';

@ApiTags('맵 관련 API (map)')
@Controller('map')
export class MapController {
  constructor(private readonly socketGateway: SocketGateway) {}
  @Inject()
  private readonly mapService: MapService;

  @Get()
  @ApiOperation({
    summary:'맵 리스트 요청',
    description:'로봇의 맵 리스트를 요청합니다. cloud.csv가 없는 폴더는 반환하지 않습니다.'
  })
  async getList(@Res() res: Response){
    try{
      httpLogger.debug(`[MAP] getList`);
      const response = await this.mapService.getMapList();
      res.send(response);
    }catch(error){
      httpLogger.error(`[MAP] getList: ${error.status} -> $${JSON.stringify(error.data)}`);
      return res.status(error.status).send(error.data);
    }
  }

  @Get('current')
  @ApiOperation({
    summary:'현재 로드된 맵 이름 요청',
    description:'로봇의 맵 이름을 요청합니다.'
  })
  async getCurrentMapName(@Res() res:Response){
    try{
      httpLogger.debug(`[MAP] getCurrentMapName: ${this.socketGateway.robotState.map.map_name}`);
      res.send(JSON.stringify(this.socketGateway.robotState.map.map_name));
    }catch(error){
      httpLogger.error(`[MAP] getCurrentMapName: ${JSON.stringify(error)}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500);
    }
  }

  @Post('load/:mapNm')
  @ApiOperation({
    summary: '맵 로드 요청',
    description:'SLAMNAV에 맵 로드를 요청합니다.'
  })
  async loadMap(@Param('mapNm') mapNm:string, @Res() res: Response){
    try{
      httpLogger.debug(`[MAP] loadMap: ${mapNm}`);
      if(mapNm == ""){
        return res.status(HttpStatus.BAD_REQUEST).send({message:"맵 이름이 지정되지 않았습니다"});
      }
      const response = await this.mapService.loadMap(mapNm);
      httpLogger.info(`[MAP] loadMap Response: ${JSON.stringify(response)}`)
      res.send(response);
    }catch(error){
      httpLogger.error(`[MAP] loadMap ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`);
      return res.status(error.status).send(error.data);
    }
  }

  @Get('cloud/:mapNm')
  @ApiOperation({
    summary: '맵 클라우드 요청',
    description:'맵 클라우드 데이터를 요청합니다.'
  })
  async getCloud(@Param('mapNm') mapNm:string, @Res() res: Response){
    try{
      httpLogger.debug(`[MAP] getCloud: ${mapNm}`);
      const response = await this.mapService.readCloud(mapNm);
      res.send(response);
    }catch(error){
      httpLogger.error(`[MAP] getCloud ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`);
      return res.status(error.status).send(error.data);
    }
  }

  @Post('cloud/:mapNm')
  @ApiOperation({
    summary: '맵 클라우드 저장',
    description:'맵 클라우드 데이터를 저장합니다.'
  })
  async saveCloud(@Param('mapNm') mapNm:string, @Body() data:any[], @Res() res: Response){
    try{
      httpLogger.debug(`[MAP] saveCloud: ${mapNm}`);
      if(mapNm == ""){
        return res.status(HttpStatus.BAD_REQUEST).send({message:"맵 이름이 지정되지 않았습니다"});
      }else if(!Array.isArray(data) || data.length == 0){
        return res.status(HttpStatus.BAD_REQUEST).send({message:"클라우드 데이터가 지정되지 않았습니다"});
      }
      const response = await this.mapService.saveCloud(mapNm,data);
      res.send(response);

      httpLogger.info(`[MAP] saveCloud -> auto map load ${mapNm}`)
      this.socketGateway.slamnav.emit('load',{command:"mapload",name:mapNm,time:Date.now().toString()})
      
    }catch(error){
      httpLogger.error(`[MAP] saveCloud ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`);
      return res.status(error.status).send(error.data);
    }
  }


  @Get('topo/:mapNm')
  @ApiOperation({
    summary: '맵 토폴로지 요청',
    description:'맵 토폴로지 데이터를 요청합니다.'
  })
  async getTopology(@Param('mapNm') mapNm:string, @Res() res: Response){
    try{
      httpLogger.debug(`[MAP] getTopology: ${mapNm}`);
      if(mapNm == ""){
        return res.status(HttpStatus.BAD_REQUEST).send({message:"맵 이름이 지정되지 않았습니다"});
      }
      const response = await this.mapService.readTopology(mapNm);
      res.send(response);
    }catch(error){
      httpLogger.error(`[MAP] getTopology ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`);
      return res.status(error.status).send(error.data);
    }
  }


  @Post('topo/:mapNm')
  @ApiOperation({
    summary: '맵 토폴로지 저장',
    description:'맵 토폴로지 데이터를 저장합니다.'
  })
  async saveTopology(@Param('mapNm') mapNm:string, @Body() data:JSON, @Res() res: Response){
    try{
      httpLogger.debug(`[MAP] saveTopology: ${mapNm}`);
      if(mapNm == ""){
        return res.status(HttpStatus.BAD_REQUEST).send({message:"맵 이름이 지정되지 않았습니다"});
      }else if(!Array.isArray(data) || data.length == 0){
        return res.status(HttpStatus.BAD_REQUEST).send({message:"토폴로지 데이터가 지정되지 않았습니다"});
      }
      const response = await this.mapService.saveTopology(mapNm,data);
      res.send(response);

      httpLogger.info(`[MAP] saveTopology -> auto map load ${mapNm}`)
      this.socketGateway.slamnav.emit('load',{command:"mapload",name:mapNm,time:Date.now().toString()})
      
    }catch(error){
      httpLogger.error(`[MAP] saveTopology ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`);
      return res.status(error.status).send(error.data);
    }
  }

  @Get('nodes/:mapNm')
  @ApiOperation({
    summary: '맵 노드 리스트 요청 (페이지네이션)',
    description:'맵 노드 리스트를 요청합니다.'
  })
  async getNodes(@Param('mapNm') mapNm:string, @Query() param: GoalReadDto, @Res() res: Response){
    try{
      httpLogger.debug(`[MAP] getNodes: ${mapNm}, ${param.pageNo}, ${param.pageSize}, ${param.type}, ${param.searchText}`);
      if(mapNm == ""){
        return res.status(HttpStatus.BAD_REQUEST).send({message:"맵 이름이 지정되지 않았습니다"});
      }
      const data = await this.mapService.readTopology(mapNm);
      const goals = [];
      console.log(data.length)
      if(Array.isArray(data)){
        data.map((node) => {
          if(node.type == param.type){
            console.log("match")
            if(param.searchText != "" && param.searchText != undefined){
              

              if(node.id.toLowerCase().includes(param.searchText.toLowerCase()) || node.name.toLowerCase().includes(param.searchText.toLowerCase())){
                console.log("in")
                goals.push({id:node.id, name:node.name, 
                  x:node.pose.split(',')[0],
                  y:node.pose.split(',')[1],
                  rz:node.pose.split(',')[2],
                });
              }
            }else{
              goals.push({id:node.id, name:node.name, 
                x:node.pose.split(',')[0],
                y:node.pose.split(',')[1],
                rz:node.pose.split(',')[2],
               });
            }
          }
        })
      }


      const totalItems = goals.length;
      const startIndex:number = (Number(param.pageNo) - 1) * Number(param.pageSize);
      const endIndex:number = startIndex + Number(param.pageSize);
      const items = goals.slice(startIndex, endIndex);
      //sort

      console.log(items)
      items.sort((a,b)=> a.name.localeCompare(b.name,undefined,{numeric:true}));
      res.send(new PaginationResponse(goals.length, Number(param.pageSize), items));

      
    }catch(error){
      httpLogger.error(`[LOG] getStatus Log : ${errorToJson(error)}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message:HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500});
    }
  }

  @Get('goals/:mapNm')
  @ApiOperation({
    summary: '맵 골 리스트 요청',
    description:'맵 골 리스트를 요청합니다.'
  })
  async getGoals(@Param('mapNm') mapNm:string, @Res() res: Response){
    try{
      httpLogger.debug(`[MAP] getGoals: ${mapNm}`);
      if(mapNm == ""){
        return res.status(HttpStatus.BAD_REQUEST).send({message:"맵 이름이 지정되지 않았습니다"});
      }
      const response = await this.mapService.readTopology(mapNm);
      const goals = [];
      if(Array.isArray(response)){
        response.map((node) => {
          if(node.type == "GOAL" || node.type == "INIT"){
            goals.push({id:node.id, name:node.name, 
              x:node.pose.split(',')[0],
              y:node.pose.split(',')[1],
              rz:node.pose.split(',')[2],
             });
          }
        })
      }
      //sort
      goals.sort((a,b)=> a.name.localeCompare(b.name,undefined,{numeric:true}));

      console.log("goals",goals);
      res.send(goals);
    }catch(error){
      httpLogger.error(`[MAP] getGoals ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`);
      return res.status(error.status).send(error.data);
    }
  }
}
