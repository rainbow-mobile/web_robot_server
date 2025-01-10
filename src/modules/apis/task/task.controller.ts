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
import { TaskService } from './task.service';
import httpLogger from '@common/logger/http.logger';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import path from 'path';
import { TaskSaveDto } from './dto/task.save.dto';
import { errorToJson } from '@common/util/error.util';

@ApiTags('태스크 관련 API (task)')
@Controller('task')
export class TaskController {
  constructor(private readonly socketGateway: SocketGateway) {}
  @Inject()
  private readonly taskService: TaskService;

  /**
   * @description 태스크 상태를 가져오는 API 엔드포인트
   * @author yjheo4@rainbow-robotics.com
   * @param mapName
   * @response 200 - 태스크 목록을 성공적으로 반환
   * @response 404 - 맵을 찾을 수 없음
   */
  @Get()
  @ApiOperation({
    summary: '태스크 데이터 요청',
    description: '태스크 데이터 요청합니다.',
  })
  @ApiResponse({
    status: 200,
    description: HttpStatusMessagesConstants.TASK.SUCCESS_READ_LIST_200,
  })
  async getTaskFile(@Res() res: Response) {
    try {
      httpLogger.info(`[TASK] getTaskFile: ${JSON.stringify(this.socketGateway.taskState)}`);
      return res.send(this.socketGateway.taskState);
    } catch (error) {
      httpLogger.error(`[TASK] getTaskFile: ${error.status} -> ${error.data}`);
      return res.status(error.status).send(error.data);
    }
  }

  /**
   * @description 태스크 정보를 가져오는 API 엔드포인트
   * @author yjheo4@rainbow-robotics.com
   * @param mapName
   * @response 200 - 태스크 정보를 성공적으로 반환
   */
  @Get('info')
  @ApiOperation({
    summary: '태스크 정보 조회',
    description: '태스크 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: HttpStatusMessagesConstants.TASK.SUCCESS_READ_LIST_200,
  })
  async getTaskInfo(@Res() res: Response) {
    try {
      httpLogger.info(`[TASK] getTaskInfo`);
      const info = await this.taskService.getTaskInfo();
      httpLogger.info(`[TASK] getTaskInfo: file(${info.file}), taskId(${info.id}), running(${info.running}), variables length(${info.variables.length})`)
      return res.send(info);
    } catch (error) {
      httpLogger.error(`[TASK] getTaskInfo: ${error.status} -> ${error.data}`);
      return res.status(error.status).send(error.data);
    }
  }

    /**
     * @description 태스크 리스트를 조회하는 API 엔드포인트
     * @author yjheo4@rainbow-robotics.com
     * @param mapName
     * @response 200 - 태스크 목록을 성공적으로 반환
     * @response 404 - 맵을 찾을 수 없음
     */
    @Get('load/:mapName/:taskName')
    @ApiOperation({
      summary: '태스크 로드',
      description: '태스크를 로드합니다.',
    })
    @ApiResponse({
      status: 200,
      description: HttpStatusMessagesConstants.TASK.SUCCESS_READ_LIST_200,
    })
    @ApiResponse({
      status: 404,
      description: HttpStatusMessagesConstants.TASK.NOT_FOUND_404,
    })
    async loadTask(
      @Param('mapName') mapName: string,
      @Param('taskName') taskName: string,
      @Res() res: Response,
    ) {
      try {
        httpLogger.info(`loadTask : ${mapName}, ${taskName}`);

        const data = await this.taskService.loadTask(
          os.homedir() + '/maps/' + mapName + '/' + taskName);

        return res.send(data);
      } catch (error) {
        httpLogger.error(`[TASK] loadTask: ${mapName}, ${taskName}, ${errorToJson(error)}`);
        return res.status(error.status).send(error.data);
      }
    }
  /**
   * @description 태스크 실행을 요청하는 API 엔드포인트
   * @author yjheo4@rainbow-robotics.com
   * @param mapName
   * @response 200 - 태스크 실행요청을 성공적으로 반환
   */
  @Get('run')
  @ApiOperation({
    summary: '태스크 실행',
    description: '태스크 실행을 요청합니다',
  })
  async runTask(@Res() res: Response) {
    try {
      httpLogger.info(`[TASK] runTask`);
      await this.taskService.runTask();
      return res.status(HttpStatus.ACCEPTED).send({message:'성공적으로 요청했습니다'});
    } catch (error) {
      httpLogger.error(`[TASK] runTask: ${errorToJson(error)}`);
      return res.status(error.status).send(error.data);
    }
  }

  /**
   * @description 태스크 종료를 요청하는 API 엔드포인트
   * @author yjheo4@rainbow-robotics.com
   * @param mapName
   * @response 200 - 태스크 종료요청을 성공적으로 반환
   */
  @Get('stop')
  @ApiOperation({
    summary: '태스크 종료',
    description: '태스크 종료를 요청합니다',
  })
  async stopTask(@Res() res: Response) {
    try {
      httpLogger.info(`[TASK] stopTask`);
      await this.taskService.stopTask();
      return res.status(HttpStatus.ACCEPTED).send({message:'성공적으로 요청했습니다'});
    } catch (error) {
      httpLogger.error(`[TASK] stopTask Error : ${errorToJson(error)}`);
      return res.status(error.status).send(error.data);
    }
  }

  /**
   * @description 태스크 리스트를 조회하는 API 엔드포인트
   * @author yjheo4@rainbow-robotics.com
   * @param mapName
   * @response 200 - 태스크 목록을 성공적으로 반환
   * @response 404 - 맵을 찾을 수 없음
   */
  @Get('list/:mapName')
  @ApiOperation({
    summary: '태스크 목록 조회',
    description: '태스크 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: HttpStatusMessagesConstants.TASK.SUCCESS_READ_LIST_200,
  })
  @ApiResponse({
    status: 404,
    description: HttpStatusMessagesConstants.TASK.NOT_FOUND_404,
  })
  async readTaskList(@Param('mapName') mapName: string, @Res() res: Response) {
    try {
      httpLogger.info(`[TASK] readTaskList: ${mapName}`);
      const tasks = await this.taskService.getTaskList(
        os.homedir() + '/maps/' + mapName,
      );
      return res.send(tasks);
    } catch (error) {
      httpLogger.error(`[TASK] readTaskList: ${mapName}, ${errorToJson(error)}`);
      return res.status(error.status).send(error.data);
    }
  }



  /**
   * @description 태스크 트리를 조회하는 API 엔드포인트
   * @author yjheo4@rainbow-robotics.com
   * @param mapName
   * @param taskName
   * @response 200 - 태스크 목록을 성공적으로 반환
   * @response 404 - 파일을 찾을 수 없음
   */
  @Get('file/:mapName/:taskName')
  @ApiOperation({
    summary: '태스크 트리 조회',
    description: '태스크 트리를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: HttpStatusMessagesConstants.TASK.SUCCESS_READ_LIST_200,
  })
  @ApiResponse({
    status: 404,
    description: HttpStatusMessagesConstants.TASK.NOT_FOUND_404,
  })
  async readTask(@Param('mapName') mapName: string, @Param('taskName') taskName: string,@Res() res: Response) {
    try {
      httpLogger.info(`[TASK] readTask: ${mapName},${taskName}`);

      if(taskName.split('.').length == 1){
        taskName += ".task";
      }

      const path = os.homedir()+"/maps/"+mapName+"/"+taskName;
      const task = await this.taskService.parse(path);
      return res.send(task);
    } catch (error) {
      httpLogger.error(`[TASK] readTask: ${mapName}, ${errorToJson(error)}`);
      return res.status(error.status).send(error.data);
    }
  }


  /**
   * @description 태스크 트리를 저장하는 API 엔드포인트
   * @author yjheo4@rainbow-robotics.com
   * @param mapName
   * @param taskName
   * @response 200 - 태스크 목록을 성공적으로 저장
   * @response 404 - 파일을 찾을 수 없음
   */
  @Post('file/:mapName/:taskName')
  @ApiOperation({
    summary: '태스크 트리 저장',
    description: '태스크 트리를 저장합니다.',
  })
  @ApiResponse({
    status: 200,
    description: HttpStatusMessagesConstants.TASK.SUCCESS_201,
  })
  @ApiResponse({
    status: 404,
    description: HttpStatusMessagesConstants.TASK.NOT_FOUND_404,
  })
  async saveTask(@Body() data:TaskSaveDto, @Param('mapName') mapName: string, @Param('taskName') taskName: string,@Res() res: Response) {
    try {
      httpLogger.info(`readTask : ${os.homedir()} ${mapName},${taskName}`);

      if(taskName.split('.').length == 1){
        taskName += ".task";
      }

      const task = await this.taskService.save(
        os.homedir()+"/maps/"+mapName+"/"+taskName, data.data
      );

      return res.send(task);

    } catch (error) {
      httpLogger.error(`[TASK] saveTask: ${mapName}, ${taskName}, ${errorToJson(error)}`);
      return res.status(error.status).send(error.data);
    }
  }
}
