import { LogService } from './log.service';
import { Response } from 'express';
import { Body, Controller, Get, Param, Res, Patch, Put, Delete, Post } from '@nestjs/common';

@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get('state')
  async getState(@Res() res: Response){
    const result =  await this.logService.getState();
    res.send(result);
  }

  @Get('power')
  async getPower(@Res() res: Response){
    res.send(await this.logService.getPower());
  }

  @Get('state/:key')
  async getStateState(@Param('key') key:string, @Res() res: Response){
    try{
      const response = await this.logService.getStateLog(key);
      res.send(response);
    }catch(error){
      res.status(error.status).send(error.data);
    }
  }

  @Get('power/:key')
  async getPowerLog(@Param('key') key:string, @Res() res: Response){
    try{
      const response = await this.logService.getPowerLog(key);
      res.send(response);
    }catch(error){
      res.status(error.status).send(error.data);
    }
  }
}
