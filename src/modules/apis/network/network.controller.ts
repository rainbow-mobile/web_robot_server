import { Body, Controller, Get, HttpStatus, Post, Put, Res } from '@nestjs/common';
import { NetworkService } from './network.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({
    summary:'현재 네트워크 상태 조회',
    description:'연결된 이더넷, 와이파이, 블루투스테더링 상태 반환'
  })
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
  @ApiOperation({
    summary:'주변 와이파이 리스트 조회',
    description:'연결가능한 주변 와이파이 리스트 반환'
  })
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
  @ApiOperation({
    summary:'주변 와이파이 리스트 조회(재스캔)',
    description:'연결가능한 주변 와이파이 리스트 반환 (다시 스캔)'
  })
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
  @ApiOperation({
    summary:'연결된 네트워크 정보 수정',
    description:'연결된 네트워크 정보 업데이트'
  })
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
  @ApiOperation({
    summary:'와이파이 새로 연결',
    description:'와이파이 새로 연결'
  })
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
