import { Controller, Post, Get, Query, Res, Body, HttpStatus, Delete, Param } from '@nestjs/common';
import { SoundService } from './sound.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SoundPlayDto } from './dto/sound.play.dto';
import { Response } from 'express';
import * as fs from 'fs';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import httpLogger from '@common/logger/http.logger';

@ApiTags('사운드 관련 API (sound)')
@Controller('sound')
export class SoundController {
  constructor(private readonly soundService: SoundService) {}

  @Post('play')
  @ApiOperation({
    summary:'사운드 플레이',
    description:'경로 내 사운드 플레이'
  })
  async playSound(@Body() body: SoundPlayDto, @Res() res: Response){
    try{
      if(body.fileNm.split('.').length < 2 || body.fileNm.split('.')[1] != "mp3"){
        res.status(HttpStatus.BAD_REQUEST).send({message:'fileNm is not mp3 format'});
      }else{
        if(body.repeat){
          const response = await this.soundService.playLoop(body);
          res.send(response);
        }else{
          const response = await this.soundService.play(body);
          res.send(response);
        }
      }
    }catch(error){
      res.status(error.status).send(error.data)
    }
  }

  @Post('stop')
  @ApiOperation({
    summary:'사운드 플레이 종료',
    description:'현재 재생중인 플레이 종료'
  })
  async playStop(@Res() res: Response){
    this.soundService.stop();
    res.send();
  }

  @Get()
  @ApiOperation({
    summary:'사운드 파일 리스트',
    description:'경로 내 사운드 파일 리스트 반환'
  })
  async getFileList(@Res() res: Response){
    const response = await this.soundService.getList("/home/rainbow/sounds");
    res.send(response);
  }

  @Delete(':name')
  @ApiOperation({
    summary:'사운드 파일 삭제',
    description:'경로 내 사운드 파일 삭제'
  })
  async deleteSound(@Param('name') name:string, @Res() res:Response){
    try{
      const path = "/home/rainbow/sounds/"+name;
      httpLogger.info(`[SOUND] Delete: ${path}`)
      if(fs.existsSync(path)){
        fs.unlinkSync(path);
        res.send(HttpStatusMessagesConstants.SUCCESS_DELETE_200);
      }else{
        res.status(HttpStatus.BAD_REQUEST).send({message:'file not found'});
      }
    }catch(error){
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message:HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,code:error});
  }
  }

}
