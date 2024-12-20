import { Controller, Get, Res, Put, Body, HttpStatus, OnModuleInit } from '@nestjs/common';
import httpLogger from '@common/logger/http.logger';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { SocketGateway } from './gateway/sockets.gateway';
import { VariablesService } from '../apis/variables/variables.service';
import { Response } from 'express';
import socketLogger from '@common/logger/socket.logger';

@ApiTags('소켓 관련 API (Sockets)')
@Controller('sockets')
export class SocketsController{
  constructor(private readonly socketGateway: SocketGateway, private readonly variableService: VariablesService) {
   this.conSocket();
  }

 
  async conSocket(){
    console.log("Connect Socket")
    global.frs_socket = await this.variableService.getVariable('frs_socket');
    global.frs_api = await this.variableService.getVariable('frs_api');
    global.frs_url = await this.variableService.getVariable('frs_url');
    socketLogger.info(`ConnectSocket First : ${global.frs_socket}`)
    this.socketGateway.connectFrsSocket(global.frs_socket);
  }

  @Get('frs/url')
  async getFrsUrl(@Res() res: Response){
    try{
      if(!global.frs_url)
        global.frs_url = await this.variableService.getVariable('frs_url');
      if(!global.frs_api)
        global.frs_api = await this.variableService.getVariable('frs_api');
      if(!global.frs_socket)
        global.frs_socket = await this.variableService.getVariable('frs_socket')
      
      res.send({url:global.frs_url,socket:global.frs_socket,api:global.frs_api});
    }catch(error){
      httpLogger.error(`GET /network/frs Error : ${error.status} -> ${error.data}`)
      return res.status(error.status).send(error.data);
    }
  }

  @Put('frs/url')
  async updateFrsUrl(@Body() data:{url:string}, @Res() res: Response){
    try{
      const url =data.url;
      console.log(url);
      if(url == "" || !url.includes('http://')){
        return res.status(HttpStatus.BAD_REQUEST).send({message:HttpStatusMessagesConstants.INVALID_DATA_400})
      }

      

      global.frs_url = url;
      global.frs_api = url+":3000";
      global.frs_socket = url+":3001/socket/robots";
      await this.variableService.upsertVariable('frs_url',global.frs_url);
      await this.variableService.upsertVariable('frs_api',global.frs_api);
      await this.variableService.upsertVariable('frs_socket',global.frs_socket);

      this.socketGateway.connectFrsSocket(global.frs_socket);
      res.send({url:url,socket:global.frs_socket,api:global.frs_api});
    }catch(error){
      httpLogger.error(`GET /network/frs Error : ${error.status} -> ${error.data}`)
      return res.status(error.status).send(error.data);
    }
  }

  @Get('frs')
  async getFrsInfo(@Res() res: Response){
    try{
      console.log("get frs ",global.robotUuid, global.robotUuid, global.frsConnect, global.robotMcAdrs)
      if(!global.frs_url)
        global.frs_url = await this.variableService.getVariable('frs_url');
      if(!global.frs_api)
        global.frs_api = await this.variableService.getVariable('frs_api');
      if(!global.frs_socket)
        global.frs_socket = await this.variableService.getVariable('frs_socket')
      
      res.send({
        connection:global.frsConnect, 
        uuid: global.robotUuid, 
        mac: global.robotMcAdrs, 
        name: global.robotNm, 
        url:global.frs_url,
        socket:global.frs_socket,
        api:global.frs_api});
    }catch(error){
      httpLogger.error(`GET /network/frs Error : ${error.status} -> ${error.data}`)
      return res.status(error.status).send(error.data);
    }
  }

  @Get('status')
  async getStatus(@Res() res: Response){
    res.send({...this.socketGateway.robotState,slam:this.socketGateway.slamnav?true:false, task:this.socketGateway.taskState});
  }
}
