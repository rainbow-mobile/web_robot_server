import { Body, Controller, Get, HttpStatus, Post, Put, Res } from '@nestjs/common';
import { NetworkService } from './network.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import httpLogger from '@common/logger/http.logger';
import { NetworkDto } from './dto/network.dto';
import { NetworkWifiDto } from './dto/network.wifi.dto';
import { VariablesService } from '../variables/variables.service';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';

@ApiTags('네트워크 관련 API (network)')
@Controller('network')
export class NetworkController {
  constructor(private readonly networkService: NetworkService, private readonly variableService: VariablesService) {}


  @Get('current')
  async getCurrentNetwork(@Res() res: Response){
    try{
      const response = await this.networkService.getNetwork();
      console.log(response);
      res.send(response);
    }catch(error){
      httpLogger.error(`GET /network/current Error : ${error.status} -> ${error.data}`)
      return res.status(error.status).send(error.data);
    }
  }

  @Get('wifi')
  async getWifiList(@Res() res: Response){
    try{
      const response = await this.networkService.getWifiList();
      console.log(response);
      res.send(response);
    }catch(error){
      httpLogger.error(`GET /network/wifi Error : ${error.status} -> ${error.data}`)
      return res.status(error.status).send(error.data);
    }
  }

  @Get('wifi/scan')
  async scanWifiList(@Res() res: Response){
    try{
      const response = await this.networkService.wifiScan();
      res.send(response);
    }catch(error){
      httpLogger.error(`GET /network/wifi/scan Error : ${error.status} -> ${error.data}`)
      return res.status(error.status).send(error.data);
    }
  }

  @Put()
  async updateNetwork(@Body() data:NetworkDto,@Res() res: Response){
    try{
      const response = await this.networkService.setIP(data);
      console.log(response);
      res.send(response);
    }catch(error){
      httpLogger.error(`PUT /network Error : ${error.status} -> ${error.data}`)
      return res.status(error.status).send(error.data);
    }
  }

  @Post('wifi')
  async connectWifi(@Body() data:NetworkWifiDto, @Res() res: Response){
    try{
      const response = await this.networkService.connectWifi(data);
      console.log(response);
      res.send(response);
    }catch(error){
      httpLogger.error(`POST /network/wifi Error : ${error.status} -> ${error.data}`)
      return res.status(error.status).send(error.data);
    }
  }

}
