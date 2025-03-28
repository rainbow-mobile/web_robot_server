import { Controller, Get, Res, Inject } from '@nestjs/common';
import { ProcessService } from './process.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { Response } from 'express';
import httpLogger from '@common/logger/http.logger';

@ApiTags('프로그램 관련 API (process)')
@Controller('process')
export class ProcessController {
  constructor(private readonly socketGateway: SocketGateway) {}
  @Inject()
  private readonly processService: ProcessService;

  @Get('connection')
  @ApiOperation({
    summary: '프로그램 연결상태 요청',
    description: '프로그램 연결상태를 요청합니다.',
  })
  async getConnection(@Res() res: Response) {
    try {
      res.send(await this.socketGateway.getConnection());
    } catch (error) {
      httpLogger.error(
        `[PROCESS] getConnection: ${error.status} -> ${error.data}`,
      );
      return res.status(error.status).send(error.data);
    }
  }
}
