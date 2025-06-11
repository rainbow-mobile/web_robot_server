import { GeneralLogType, GeneralOperationStatus, GeneralScope, GeneralStatus, VehicleOperationName } from '@common/enum/equipment.enum';
import { generateGeneralLog } from '@common/logger/equipment.logger';
import httpLogger from '@common/logger/http.logger';
import { HttpStatus, Injectable } from '@nestjs/common';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';

@Injectable()
export class MoveService {
  constructor(private readonly socketGateway: SocketGateway) {}

  async moveCommand(data: any) {
    return new Promise((resolve, reject) => {
      if (this.socketGateway.slamnav != null) {
        this.socketGateway.server.to('slamnav').emit('move', data);
        httpLogger.info(`[MOVE] moveCommand: ${JSON.stringify(data)}`);

        this.socketGateway.slamnav.once('moveResponse', (data2) => {
          httpLogger.info(
            `[MOVE] moveCommand Response: ${JSON.stringify(data2)}`,
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

  async moveJog(data: object) {
    if (this.socketGateway.slamnav != null) {
      this.socketGateway.server.to('slamnav').emit('move', data);
    }
  }
}
