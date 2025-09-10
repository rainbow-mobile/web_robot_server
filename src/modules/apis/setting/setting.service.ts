import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import {
  SettingRequestSlamnav,
  SettingResponseSlamnav,
  SettingResponseDto,
} from './dto/setting.dto';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import httpLogger from '@common/logger/http.logger';

@Injectable()
export class SettingService {
  constructor(private readonly socketGateway: SocketGateway) {}

  async settingRequest(
    dto: SettingRequestSlamnav,
  ): Promise<SettingResponseDto> {
    return new Promise(async (resolve, reject) => {
      if (this.socketGateway.slamnav != null) {
        httpLogger.info(`[SETTING] settingRequest: ${JSON.stringify(dto)}`);
        this.socketGateway.slamnav.emit('settingRequest', dto);

        this.socketGateway.slamnav.once('settingResponse', (data) => {
          const json = JSON.parse(data);
          httpLogger.info(
            `[SETTING] settingResponse: ${JSON.stringify(json)}, ${json.result}`,
          );
          if (json.result == 'success' || json.result == 'accept') {
            resolve({
              param: json.param,
              preset: json.preset,
              list: json.list,
            });
          } else if (json.result == 'fail') {
            reject({
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              message: json.message,
            });
          } else if (json.result == 'reject') {
            reject({
              status: HttpStatus.BAD_REQUEST,
              message: json.message,
            });
          } else {
            resolve({
              param: json.param,
              preset: json.preset,
              list: json.list,
            });
          }
          clearTimeout(timeoutId);
        });

        const timeoutId = setTimeout(() => {
          reject({
            status: HttpStatus.GATEWAY_TIMEOUT,
            message: '프로그램이 응답하지 않습니다',
          });
        }, 5000); // 5초 타임아웃
      } else {
        reject({
          status: HttpStatus.GATEWAY_TIMEOUT,
          message: '프로그램이 연결되지 않았습니다',
        });
      }
    });
  }
}
