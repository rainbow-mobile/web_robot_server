import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { MoveService } from './move.service';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import httpLogger from '@common/logger/http.logger';
import { Response } from 'express';
import { MoveCommandDto } from 'src/modules/apis/move/dto/move.command.dto';
import { errorToJson } from '@common/util/error.util';
import { generateGeneralLog } from '@common/logger/equipment.logger';
import { GeneralLogType, GeneralOperationStatus, GeneralScope, GeneralStatus, VehicleOperationName } from '@common/enum/equipment.enum';
import { HttpError } from '@influxdata/influxdb3-client';

@ApiTags('이동 관련 API (move)')
@Controller('move')
export class MoveController {
  constructor(private readonly socketGateway: SocketGateway) {}

  @Inject()
  private readonly moveService: MoveService;

  /**
   * @description 로봇 이동 명령을 처리하는 API 엔드포인트
   * @author yjheo4@rainbow-robotics.com
   * @param mapName
   * @response 200 - 요청한 이동 명령을 성공적으로 전달
   * @response 400 - 데이터가 부족함
   */
  @Post()
  @ApiOperation({
    summary: '이동 명령',
    description: `이동 명령을 요청합니다.
     command의 값에는 goal, target, jog, stop, pause, resume 이 존재합니다.
     command가 goal인 경우, id, method, preset을 파라메터로 인식합니다.
     command가 target인 경우, x,y,z,rz,method,preset을 파라메터로 인식합니다.
     command가 jog인 경우, vx, vy, wz를 파라메터로 인식합니다.
     그 외의 command는 파라메터를 입력받지 않습니다.
     method는 주행방식을 선언합니다. 기본 pp (point to point) 방식으로 주행하며 그 외 주행방식은 아직 미지원합니다.
     preset은 지정된 속도프리셋을 설정합니다. 아직 미지원합니다.`,
  })
  @ApiResponse({
    status: 200,
    description: HttpStatusMessagesConstants.MOVE.MOVE_ACCEPT_200,
  })
  async moveControl(@Body() data: MoveCommandDto, @Res() res: Response) {
    try {
      httpLogger.info(`[MOVE] moveControl: ${JSON.stringify(data)}`);
      if (data.command == 'goal') {
        if (data.goal_id == '' || data.method == '' || data.preset == '') {
          httpLogger.warn(`[MOVE] moveControl: move Goal parameter missing`);
          return res
            .status(HttpStatus.BAD_REQUEST)
            .send({ message: 'parameter missing (id, method, preset)' });
        }
      } else if (data.command == 'target') {
        if (
          data.x == '' ||
          data.y == '' ||
          data.rz == '' ||
          data.method == '' ||
          data.preset == ''
        ) {
          httpLogger.warn(`[MOVE] moveControl: move Target parameter missing`);
          return res
            .status(HttpStatus.BAD_REQUEST)
            .send({ message: 'parameter missing (x, y, rz, method, preset)' });
        }
      } else if (data.command == 'jog') {
        if (data.vx == '' || data.vy == '' || data.wz == '') {
          httpLogger.warn(`[MOVE] moveControl: move Target parameter missing`);
          return res
            .status(HttpStatus.BAD_REQUEST)
            .send({ message: 'parameter missing (x, y, rz, method, preset)' });
        }
      } else if (
        data.command == 'stop' ||
        data.command == 'pause' ||
        data.command == 'resume'
      ) {
      } else {
        httpLogger.warn(
          `[MOVE] moveControl: move Command parameter unknown : ${data.command}`,
        );
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: 'Unknown Parameter (command)' });
      }

      const newData = { ...data, time: Date.now().toString() };
      httpLogger.debug(`[MOVE] moveControl: ${JSON.stringify(newData)}`);

      if (data.command != 'jog') {
        const response = await this.moveService.moveCommand(newData);
        httpLogger.debug(
          `[MOVE] moveControl Response: ${JSON.stringify(response)}`,
        );
        return res.send(response);
      } else {
        this.moveService.moveJog(newData);
        return res.send();
      }
    } catch (error) {
      httpLogger.error(
        `[MOVE] moveControl: ${JSON.stringify(data)}, ${errorToJson(error)}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  /**
   * @description 로봇 이동 명령을 처리하는 API 엔드포인트
   * @author yjheo4@rainbow-robotics.com
   * @response 200 - 요청한 이동 명령을 성공적으로 전달
   * @response 400 - 데이터가 부족함
   */
  @Get('stop')
  @ApiOperation({
    summary: '이동 정지 명령',
    description: '이동 정지를 요청합니다.',
  })
  @ApiResponse({
    status: 200,
    description: HttpStatusMessagesConstants.MOVE.MOVE_ACCEPT_200,
  })
  async moveStop(@Res() res: Response) {
    try {
      const newData = { command: 'stop', time: Date.now().toString() };
      httpLogger.debug(`[MOVE] moveStop: ${JSON.stringify(newData)}`);
      const response = await this.moveService.moveCommand(newData);
      httpLogger.debug(`[MOVE] moveStop Response: ${JSON.stringify(response)}`);
      return res.send(response);
    } catch (error) {
      httpLogger.error(`[MOVE] moveStop:  ${errorToJson(error)}`);
      return res.status(error.status).send(error.data);
    }
  }

  /**
   * @description 로봇 이동 명령을 처리하는 API 엔드포인트
   * @author yjheo4@rainbow-robotics.com
   * @response 200 - 요청한 이동 명령을 성공적으로 전달
   * @response 400 - 데이터가 부족함
   */
  @Get('pause')
  @ApiOperation({
    summary: '이동 일시정지 명령',
    description: '이동 일시정지를 요청합니다.',
  })
  @ApiResponse({
    status: 200,
    description: HttpStatusMessagesConstants.MOVE.MOVE_ACCEPT_200,
  })
  async movePause(@Res() res: Response) {
    try {
      const newData = { command: 'pause', time: Date.now().toString() };
      httpLogger.debug(`[MOVE] movePause: ${JSON.stringify(newData)}`);
      const response = await this.moveService.moveCommand(newData);
      httpLogger.debug(
        `[MOVE] movePause Response: ${JSON.stringify(response)}`,
      );
      return res.send(response);
    } catch (error) {
      httpLogger.error(`[MOVE] movePause: ${errorToJson(error)}`);
      return res.status(error.status).send(error.data);
    }
  }
  /**
   * @description 로봇 이동 명령을 처리하는 API 엔드포인트
   * @author yjheo4@rainbow-robotics.com
   * @response 200 - 요청한 이동 명령을 성공적으로 전달
   * @response 400 - 데이터가 부족함
   */
  @Get('resume')
  @ApiOperation({
    summary: '이동 재개 명령',
    description: '이동 재개를 요청합니다.',
  })
  @ApiResponse({
    status: 200,
    description: HttpStatusMessagesConstants.MOVE.MOVE_ACCEPT_200,
  })
  async moveResume(@Res() res: Response) {
    try {
      const newData = { command: 'resume', time: Date.now().toString() };
      httpLogger.debug(`[MOVE] moveResume: ${JSON.stringify(newData)}`);
      const response = await this.moveService.moveCommand(newData);
      httpLogger.debug(
        `[MOVE] moveResume Response: ${JSON.stringify(response)}`,
      );
      return res.send(response);
    } catch (error) {
      httpLogger.error(`[MOVE] moveResume: ${errorToJson(error)}`);
      return res.status(error.status).send(error.data);
    }
  }

  @Get('log/:num')
  @ApiOperation({
    summary: '이동 명령 이력 조회',
    description: '이동 명령 이력을 조회합니다. ',
  })
  async moveLog(@Param('num') num: number) {
    try {
      return this.moveService.getMoveLog(num);
    } catch (error) {
      httpLogger.error(`[MOVE] moveLog: ${errorToJson(error)}`);
      if (error instanceof HttpError) throw error;
      throw new HttpError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        '에러가 발생했습니다.',
      );
    }
  }

  @Get('log/goal/:num')
  @ApiOperation({
    summary: 'Goal 이동 명령 이력 조회',
    description: 'Goal 이동 명령 이력을 조회합니다. ',
  })
  async moveGoalLog(@Param('num') num: number) {
    try {
      return this.moveService.getMoveLog(num, 'goal');
    } catch (error) {
      httpLogger.error(`[MOVE] moveGoalLog: ${errorToJson(error)}`);
      if (error instanceof HttpError) throw error;
      throw new HttpError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        '에러가 발생했습니다.',
      );
    }
  }
}
