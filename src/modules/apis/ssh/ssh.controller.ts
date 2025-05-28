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
//   import { AuthGuard } from '@auth/security/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import * as os from 'os';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { Response } from 'express';
import { SSHService } from './ssh.service';
import httpLogger from '@common/logger/http.logger';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import path from 'path';
import { Client } from 'ssh2';
import { errorToJson } from '@common/util/error.util';
import { CommandDto } from './dto/command.dto';

@ApiTags('SSH 관련 API (ssh)')
@Controller('ssh')
export class SSHController {
  constructor(private readonly socketGateway: SocketGateway) {}

  @Inject()
  private readonly taskService: SSHService;
  private conn: Client;

  @Get(':host')
  async sshConnect(@Param('host') host: string, @Res() res: Response) {
    try {
      this.conn = new Client();
      this.conn
        .on('ready', () => {
          console.log('SSH 연결 완료');
        })
        .connect({
          host: host,
          port: 22,
          username: 'rainbow',
          password: 'rainbow',
        });
    } catch (error) {
      console.error(error);
    }
  }

  @Post(':host')
  async sshCommand(
    @Param('host') host: string,
    @Body() data: CommandDto,
    @Res() res: Response,
  ) {
    try {
      console.log('COMMAND : ', data.command);
      this.conn = new Client();
      this.conn
        .on('ready', () => {
          this.conn.exec(data.command, (err, stream) => {
            if (err) throw err;

            stream.on('close', () => {
              console.log('✅ 명령 실행 완료');
              res.end();
              this.conn.end();
            });

            stream.on('data', (data) => {
              console.log('STDOUT:', data.toString());
              res.write(data.toString());
            });

            stream.stderr.on('data', (data) => {
              console.log('STDERR:', data.toString());
              res.write(data.toString());
            });
          });
        })
        .connect({
          host: host,
          port: 22,
          username: 'rainbow',
          password: 'rainbow',
        });
    } catch (error) {
      console.error(error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500);
    }
  }
}
