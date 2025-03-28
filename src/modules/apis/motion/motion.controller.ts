import { Controller, Inject, Post, Body } from '@nestjs/common';
import { MotionService } from './motion.service';
import { ApiTags } from '@nestjs/swagger';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { MotionCommandDto } from './dto/motion.dto';
import httpLogger from '@common/logger/http.logger';

@ApiTags('로봇 motion 관련 api (motion)')
@Controller('motion')
export class MotionController {
  constructor(private readonly socketGateway: SocketGateway) {}

  @Inject()
  private readonly motionService: MotionService;

  /**
   * @description 로봇 motion 변경 명령을 처리하는 API 엔드포인트
   * @author dfd1123@rainbow-robotics.com
   * @param {MotionCommandDto} data
   * @response 200 - 요청한 이동 명령을 성공적으로 전달
   * @response 400 - 데이터가 부족함
   */
  @Post()
  async move(@Body() data: MotionCommandDto) {
    httpLogger.info(`[MOTION] motionControl: ${JSON.stringify(data)}`);

    return this.motionService.motionCommand(data);
  }
}
