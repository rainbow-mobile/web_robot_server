import { HttpStatus, Injectable } from '@nestjs/common';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { MotionCommandDto } from './dto/motion.dto';
import httpLogger from '@common/logger/http.logger';

@Injectable()
export class MotionService {
  constructor(private readonly socketGateway: SocketGateway) {}

  async motionCommand(data: MotionCommandDto) {
    return new Promise((resolve, reject) => {
      if (this.socketGateway.slamnav != null) {
        this.socketGateway.server.to('slamnav').emit('motion', data);
        httpLogger.info(`[MOTION] motionCommand: ${JSON.stringify(data)}`);

        this.socketGateway.slamnav.once('motionResponse', (data2) => {
          httpLogger.info(
            `[MOTION] motionCommand Response: ${JSON.stringify(data2)}`,
          );
          resolve(data2);
          clearTimeout(timeoutId);
        });

        const timeoutId = setTimeout(() => {
          reject({
            status: HttpStatus.GATEWAY_TIMEOUT,
            data: { message: '프로그램이 응답하지 않습니다' },
          });
        }, 5000); // 5초 타임아웃
      } else {
        reject({
          status: HttpStatus.GATEWAY_TIMEOUT,
          data: { message: '프로그램이 연결되지 않았습니다' },
        });
      }
    });
  }
}
