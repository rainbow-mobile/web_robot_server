import { Body, Controller, Get, HttpStatus, Inject, Param, Post, Res } from '@nestjs/common';
import { MapService } from './map.service';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import httpLogger from '@common/logger/http.logger';
import { Response } from 'express';

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
      const response = await this.mapService.getMapList();
      res.send(response);
    }catch(error){
      httpLogger.error(`/map Error : ${error.status} -> ${error.data}`);
      return res.status(error.status).send(error.data);
    }
  }

  @Post('load/:mapNm')
  @ApiOperation({
    summary: '맵 로드 요청',
    description:'SLAMNAV에 맵 로드를 요청합니다.'
  })
  async loadMap(@Param('mapNm') mapNm:string, @Res() res: Response){
    try{
      if(mapNm == ""){
        return res.status(HttpStatus.BAD_REQUEST).send({message:"맵 이름이 지정되지 않았습니다"});
      }
      const response = await this.mapService.loadMap(mapNm);
      res.send(response);
    }catch(error){
      httpLogger.error(`GET /map/goals/${mapNm} Error : ${error.status} -> ${error.data}`);
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
      const response = await this.mapService.readCloud(mapNm);
      res.send(response);
    }catch(error){
      httpLogger.error(`GET /map/cloud/${mapNm} Error : ${error.status} -> ${error.data}`);
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
      if(mapNm == ""){
        return res.status(HttpStatus.BAD_REQUEST).send({message:"맵 이름이 지정되지 않았습니다"});
      }else if(!Array.isArray(data) || data.length == 0){
        return res.status(HttpStatus.BAD_REQUEST).send({message:"클라우드 데이터가 지정되지 않았습니다"});
      }
      const response = await this.mapService.saveCloud(mapNm,data);
      res.send(response);
    }catch(error){
      httpLogger.error(`POST /map/cloud/${mapNm} Error : ${error.status} -> ${error.data}`);
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
      if(mapNm == ""){
        return res.status(HttpStatus.BAD_REQUEST).send({message:"맵 이름이 지정되지 않았습니다"});
      }
      const response = await this.mapService.readTopology(mapNm);
      res.send(response);
    }catch(error){
      httpLogger.error(`GET /map/topo/${mapNm} Error : ${error.status} -> ${error.data}`);
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
      if(mapNm == ""){
        return res.status(HttpStatus.BAD_REQUEST).send({message:"맵 이름이 지정되지 않았습니다"});
      }else if(!Array.isArray(data) || data.length == 0){
        return res.status(HttpStatus.BAD_REQUEST).send({message:"토폴로지 데이터가 지정되지 않았습니다"});
      }
      const response = await this.mapService.saveTopology(mapNm,data);
      res.send(response);
    }catch(error){
      httpLogger.error(`POST /map/topo/${mapNm} Error : ${error.status} -> ${error.data}`);
      return res.status(error.status).send(error.data);
    }
  }

  @Get('goals/:mapNm')
  @ApiOperation({
    summary: '맵 골 리스트 요청',
    description:'맵 골 리스트를 요청합니다.'
  })
  async getGols(@Param('mapNm') mapNm:string, @Res() res: Response){
    try{
      if(mapNm == ""){
        return res.status(HttpStatus.BAD_REQUEST).send({message:"맵 이름이 지정되지 않았습니다"});
      }
      const response = await this.mapService.readTopology(mapNm);
      const goals = [];
      if(Array.isArray(response)){
        response.map((node) => {
          if(node.type == "GOAL" || node.type == "INIT"){
            goals.push({id:node.id, name:node.name});
          }
        })
      }
      res.send(goals);
    }catch(error){
      httpLogger.error(`GET /map/goals/${mapNm} Error : ${error.status} -> ${error.data}`);
      return res.status(error.status).send(error.data);
    }
  }

}
